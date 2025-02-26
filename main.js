// Global variable to store the conversion table data
let conversionTable = {
    distances: [],
    ratios: []
  };
  
  // Load the CSV file and set up the converter
  document.addEventListener('DOMContentLoaded', function() {
    loadConversionTable();
    
    // Set up event listeners
    document.getElementById('knownDistance').addEventListener('change', updateResult);
    document.getElementById('knownTime').addEventListener('change', updateResult);
    document.getElementById('targetDistance').addEventListener('change', updateResult);
  });
  
  // Load conversion table from CSV
  function loadConversionTable() {
    Papa.parse('data/conversion-table.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: function(results) {
        // Process the CSV data into our conversion table format
        const data = results.data;
        
        // Get distances from the header row
        conversionTable.distances = Object.keys(data[0]).slice(1).map(Number);
        
        // Get ratios from the data rows
        conversionTable.ratios = data.map(row => {
          return Object.values(row).slice(1);
        });
        
        // Initial calculation after loading
        updateResult();
      },
      error: function(error) {
        console.error('Error loading conversion table:', error);
      }
    });
  }
  
  // Update the result when inputs change
  function updateResult() {
    const knownDistance = parseFloat(document.getElementById('knownDistance').value);
    const knownTime = parseFloat(document.getElementById('knownTime').value);
    const targetDistance = parseFloat(document.getElementById('targetDistance').value);
    
    if (isNaN(knownTime) || knownTime <= 0) {
      document.getElementById('result').innerHTML = '<p class="error">Please enter a valid time.</p>';
      return;
    }
    
    // Find indices in the conversion table
    const knownIndex = conversionTable.distances.indexOf(knownDistance);
    const targetIndex = conversionTable.distances.indexOf(targetDistance);
    
    if (knownIndex === -1 || targetIndex === -1) {
      document.getElementById('result').innerHTML = '<p class="error">Distance not found in conversion table.</p>';
      return;
    }
    
    // Get the ratio and calculate predicted time
    const ratio = conversionTable.ratios[targetIndex][knownIndex];
    const predictedTime = knownTime * ratio;
    
    // Display result
    document.getElementById('result').innerHTML = `
      <h2>Predicted Time</h2>
      <p class="predicted-time">${predictedTime.toFixed(2)} seconds</p>
      <p class="time-info">Based on ${knownTime.toFixed(2)}s at ${knownDistance}m</p>
    `;
    
    // Generate data for all distances
    const allTimes = conversionTable.distances.map((dist, idx) => {
      const r = conversionTable.ratios[idx][knownIndex];
      return {
        distance: dist,
        time: knownTime * r
      };
    });
    
    // Create chart
    createChart(allTimes);
    
    // Create table
    createTable(allTimes, targetDistance);
  }
  
  // Create a chart showing predicted times
  function createChart(data) {
    const chartContainer = document.getElementById('chartContainer');
    chartContainer.innerHTML = '<canvas id="performanceChart"></canvas>';
    
    const ctx = document.getElementById('performanceChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.distance),
        datasets: [{
          label: 'Predicted Time (seconds)',
          data: data.map(d => d.time),
          borderColor: '#4361ee',
          backgroundColor: 'rgba(67, 97, 238, 0.1)',
          tension: 0.1
        }]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            title: {
              display: true,
              text: 'Distance (meters)'
            }
          },
          y: {
            title: {
              display: true,
              text: 'Time (seconds)'
            }
          }
        }
      }
    });
  }
  
  // Create a table showing predicted times for all distances
  function createTable(data, targetDistance) {
    const tableContainer = document.getElementById('tableContainer');
    
    let tableHTML = `
      <h2>Predicted Times for All Distances</h2>
      <table>
        <thead>
          <tr>
            <th>Distance (m)</th>
            <th>Predicted Time (s)</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    data.forEach(item => {
      const isTarget = item.distance === targetDistance;
      tableHTML += `
        <tr${isTarget ? ' class="highlight"' : ''}>
          <td>${item.distance}${item.distance === 36.576 ? ' (40yd)' : ''}</td>
          <td>${item.time.toFixed(2)}</td>
        </tr>
      `;
    });
    
    tableHTML += `
        </tbody>
      </table>
    `;
    
    tableContainer.innerHTML = tableHTML;
  }