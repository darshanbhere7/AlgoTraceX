// PDF Report Generator Utility
// Uses jsPDF and html2canvas to generate comprehensive progress reports

let jsPDF = null;
let html2canvas = null;

// Dynamically import libraries
const loadLibraries = async () => {
  if (!jsPDF) {
    try {
      const jsPDFModule = await import('jspdf');
      // jsPDF v2 uses named export { jsPDF }
      if (jsPDFModule.jsPDF) {
        jsPDF = jsPDFModule.jsPDF;
      } else if (jsPDFModule.default && jsPDFModule.default.jsPDF) {
        jsPDF = jsPDFModule.default.jsPDF;
      } else if (jsPDFModule.default) {
        // Some versions export default as the class
        jsPDF = jsPDFModule.default;
      } else {
        throw new Error('jsPDF export not found');
      }
      
      // Verify it's a constructor
      if (typeof jsPDF !== 'function') {
        throw new Error('jsPDF is not a constructor function');
      }
    } catch (error) {
      console.error('Failed to load jsPDF:', error);
      throw new Error('jsPDF library not available. Please run: npm install jspdf');
    }
  }
  
  if (!html2canvas) {
    try {
      const html2canvasModule = await import('html2canvas');
      html2canvas = html2canvasModule.default || html2canvasModule;
      
      if (typeof html2canvas !== 'function') {
        throw new Error('html2canvas is not a function');
      }
    } catch (error) {
      console.error('Failed to load html2canvas:', error);
      throw new Error('html2canvas library not available. Please run: npm install html2canvas');
    }
  }
};

/**
 * Convert SVG to image data URL (bypasses oklch issues)
 */
const svgToImage = (svgElement) => {
  return new Promise((resolve) => {
    try {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    } catch (error) {
      console.error('SVG conversion error:', error);
      resolve(null);
    }
  });
};

/**
 * Capture a chart element as base64 image
 * Handles oklch color issues by using SVG conversion or html2canvas with color overrides
 */
const captureChart = async (elementId, options = {}) => {
  try {
    await loadLibraries();
    
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with ID "${elementId}" not found`);
      return null;
    }

    // Wait a bit for charts to render
    await new Promise(resolve => setTimeout(resolve, 500));

    // Try to find SVG element first (Recharts uses SVG)
    const svgElement = element.querySelector('svg');
    
    // If SVG found, try converting it directly (avoids oklch parsing)
    if (svgElement) {
      try {
        const svgImage = await svgToImage(svgElement);
        if (svgImage) {
          return svgImage;
        }
      } catch (svgError) {
        console.warn('SVG conversion failed, falling back to html2canvas:', svgError);
      }
    }

    // Fallback to html2canvas with color overrides
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          // Inject CSS to force RGB colors and override oklch
          const styleSheet = clonedDoc.createElement('style');
          styleSheet.textContent = `
            /* Force RGB colors to avoid oklch parsing errors */
            * {
              color: rgb(0, 0, 0) !important;
            }
            svg, svg * {
              fill: rgb(59, 130, 246) !important;
              stroke: rgb(59, 130, 246) !important;
            }
            .recharts-wrapper * {
              color: rgb(0, 0, 0) !important;
            }
          `;
          clonedDoc.head.appendChild(styleSheet);
          
          // Process all elements to remove oklch from computed styles
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            if (el.style) {
              // Clear any style properties that might contain oklch
              const computedStyle = window.getComputedStyle(el);
              ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke'].forEach((prop) => {
                const value = computedStyle[prop] || el.style[prop];
                if (value && (value.includes('oklch') || value.includes('color('))) {
                  el.style[prop] = '';
                }
              });
            }
          });
        },
        ...options,
      });
      
      if (!canvas) {
        return null;
      }
      
      return canvas.toDataURL('image/png', 0.95);
    } catch (captureError) {
      // If oklch error, try with even simpler options
      if (captureError.message && captureError.message.includes('oklch')) {
        console.warn('oklch color error, trying minimal capture');
        try {
          const canvas = await html2canvas(element, {
            scale: 1.5,
            useCORS: false,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: false,
            foreignObjectRendering: false,
          });
          return canvas ? canvas.toDataURL('image/png', 0.95) : null;
        } catch (retryError) {
          console.error('Minimal capture also failed:', retryError);
          return null;
        }
      }
      throw captureError;
    }
  } catch (error) {
    console.error(`Error capturing chart ${elementId}:`, error);
    return null;
  }
};

/**
 * Generate comprehensive PDF report
 */
export const generatePDFReport = async (data) => {
  try {
    await loadLibraries();
  } catch (error) {
    console.error('Library loading error:', error);
    throw error;
  }
  
  if (!jsPDF || typeof jsPDF !== 'function') {
    throw new Error('jsPDF is not properly loaded as a constructor');
  }
  
  if (!html2canvas || typeof html2canvas !== 'function') {
    throw new Error('html2canvas is not properly loaded');
  }
  
  // Create jsPDF instance
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Helper to add new page if needed
  const checkPageBreak = (requiredHeight) => {
    if (yPosition + requiredHeight > pageHeight - margin) {
      pdf.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper to add text with word wrap
  const addText = (text, fontSize = 12, isBold = false, color = [0, 0, 0]) => {
    pdf.setFontSize(fontSize);
    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    pdf.setTextColor(color[0], color[1], color[2]);
    
    const maxWidth = pageWidth - 2 * margin;
    const lines = pdf.splitTextToSize(text, maxWidth);
    
    checkPageBreak(lines.length * (fontSize * 0.4) + 5);
    
    lines.forEach((line) => {
      pdf.text(line, margin, yPosition);
      yPosition += fontSize * 0.4;
    });
    
    yPosition += 5;
  };

  try {
    // Title
    addText('AlgoTraceX - Progress Report', 20, true, [59, 130, 246]);
    addText(`Generated on ${new Date().toLocaleDateString()}`, 10, false, [107, 114, 128]);
    yPosition += 10;

    // Overall Progress Section
    addText('Overall Progress', 16, true);
    addText(`Completion: ${data.overallProgress?.toFixed(1) || 0}%`, 12);
    addText(`Completed: ${data.completedCount || 0} of ${data.totalQuestions || 0} questions`, 12);
    yPosition += 5;

    // Capture Overall Progress Chart (with timeout)
    try {
      const overallChartImg = await Promise.race([
        captureChart('pdf-overall-chart'),
        new Promise((resolve) => setTimeout(() => resolve(null), 3000))
      ]);
      if (overallChartImg) {
        checkPageBreak(60);
        pdf.addImage(overallChartImg, 'PNG', margin, yPosition, pageWidth - 2 * margin, 50);
        yPosition += 55;
      }
    } catch (chartError) {
      console.warn('Could not capture overall chart:', chartError);
      // Continue without chart
    }

    // Topic-wise Progress Section
    if (data.topicProgress && data.topicProgress.length > 0) {
      checkPageBreak(30);
      addText('Topic-wise Progress', 16, true);
      
      data.topicProgress.forEach((topic) => {
        const topicText = `${topic.topic}: ${topic.completed}/${topic.total} (${topic.progress.toFixed(1)}%)`;
        addText(topicText, 11);
      });
      yPosition += 5;

      // Capture Topic Progress Chart (with timeout)
      try {
        const topicChartImg = await Promise.race([
          captureChart('pdf-topic-chart'),
          new Promise((resolve) => setTimeout(() => resolve(null), 3000))
        ]);
        if (topicChartImg) {
          checkPageBreak(60);
          pdf.addImage(topicChartImg, 'PNG', margin, yPosition, pageWidth - 2 * margin, 50);
          yPosition += 55;
        }
      } catch (chartError) {
        console.warn('Could not capture topic chart:', chartError);
        // Continue without chart
      }
    }

    // Test Results Section
    if (data.testResults && data.testResults.length > 0) {
      checkPageBreak(30);
      addText('Weekly Test Results', 16, true);
      
      // Capture Test Trends Chart (with timeout)
      try {
        const testChartImg = await Promise.race([
          captureChart('pdf-test-chart'),
          new Promise((resolve) => setTimeout(() => resolve(null), 3000))
        ]);
        if (testChartImg) {
          checkPageBreak(60);
          pdf.addImage(testChartImg, 'PNG', margin, yPosition, pageWidth - 2 * margin, 50);
          yPosition += 55;
        }
      } catch (chartError) {
        console.warn('Could not capture test chart:', chartError);
        // Continue without chart
      }

      // Test Results Table
      checkPageBreak(20);
      addText('Test Details:', 12, true);
      data.testResults.slice(0, 10).forEach((test) => {
        const testText = `${test.name || 'Test'}: ${test.score || 0}% (${test.correctAnswers || 0}/${test.totalQuestions || 0}) - ${test.dateString || ''}`;
        addText(testText, 10);
      });
      yPosition += 5;
    }

    // Achievements Section
    if (data.achievements && data.achievements.length > 0) {
      checkPageBreak(30);
      addText('Achievements & Badges', 16, true);
      addText(`Total Badges Unlocked: ${data.achievements.length}`, 12);
      
      const achievementNames = data.achievements.map((a) => a.name).join(', ');
      if (achievementNames) {
        addText(achievementNames, 10);
      }
      yPosition += 5;
    }

    // Streak Information
    if (data.streakData) {
      checkPageBreak(20);
      addText('Streak Information', 16, true);
      addText(`Current Streak: ${data.streakData.streak || 0} days`, 12);
      yPosition += 5;
    }

    // Footer
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Page ${i} of ${totalPages} - AlgoTraceX Progress Report`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    const fileName = `AlgoTraceX-Progress-Report-${new Date().toISOString().split('T')[0]}.pdf`;
    
    try {
      // Try standard save method first
      pdf.save(fileName);
      return { success: true, fileName };
    } catch (saveError) {
      console.warn('Standard save failed, trying alternative method:', saveError);
      try {
        // Alternative save method using blob
        const pdfBlob = pdf.output('blob');
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        return { success: true, fileName };
      } catch (blobError) {
        console.error('Blob save also failed:', blobError);
        // Last resort: try data URI
        try {
          const pdfDataUri = pdf.output('datauristring');
          const link = document.createElement('a');
          link.href = pdfDataUri;
          link.download = fileName;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          setTimeout(() => {
            document.body.removeChild(link);
          }, 100);
          return { success: true, fileName };
        } catch (dataUriError) {
          console.error('All save methods failed:', dataUriError);
          throw new Error('Failed to save PDF. Please check browser console for details.');
        }
      }
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export default generatePDFReport;
