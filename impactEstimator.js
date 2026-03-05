function estimateImpact(analysisResults) {
  let totalEnergyWaste = 0;
  const impactDetails = [];

  // Energy waste estimates (in watt-hours per 1000 executions)
  const impactWeights = {
    'inefficient_loop': { low: 0.1, medium: 0.5, high: 2.0 },
    'memory_leak': { low: 0.2, medium: 1.0, high: 5.0 },
    'chained_array_methods': { low: 0.05, medium: 0.2, high: 0.8 },
    'sparse_array': { low: 0.1, medium: 0.3, high: 1.0 },
    'loose_equality': { low: 0.01, medium: 0.05, high: 0.1 },
    'accidental_global': { low: 0.1, medium: 0.4, high: 1.5 },
    'console_log': { low: 0.02, medium: 0.1, high: 0.3 },
    'default': { low: 0.05, medium: 0.2, high: 0.5 }
  };

  for (const file of analysisResults) {
    let fileWaste = 0;
    
    for (const issue of file.issues) {
      const weights = impactWeights[issue.type] || impactWeights.default;
      const waste = weights[issue.severity] || weights.medium;
      
      fileWaste += waste;
      
      impactDetails.push({
        file: file.file,
        line: issue.line,
        type: issue.type,
        severity: issue.severity,
        estimatedWaste: waste,
        suggestion: issue.suggestion
      });
    }
    
    totalEnergyWaste += fileWaste;
  }

  // Determine overall severity
  let severity = 'low';
  if (totalEnergyWaste > 10) severity = 'high';
  else if (totalEnergyWaste > 3) severity = 'medium';

  // Calculate potential savings (assuming fixes)
  const potentialSavings = totalEnergyWaste * 0.7; // 70% of waste can be eliminated

  return {
    totalWaste: totalEnergyWaste.toFixed(2),
    totalSavings: potentialSavings.toFixed(2),
    severity,
    details: impactDetails,
    co2Equivalent: (potentialSavings * 0.4).toFixed(2), // Rough CO2 equivalent in grams
    estimatedCost: (potentialSavings * 0.12).toFixed(2) // Estimated cost savings in cents
  };
}

module.exports = { estimateImpact };