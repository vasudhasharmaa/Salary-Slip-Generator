const salaryForm = document.getElementById('salary-form');
const modal = document.getElementById('previewModal');
const closeBtn = document.querySelector('.close');
const saveBtn = document.getElementById('saveButton');
const cancelBtn = document.getElementById('cancelButton');
let pdfDoc = null;

// Add event listeners for modal controls
closeBtn.onclick = () => modal.style.display = "none";
cancelBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// Save PDF when save button is clicked
saveBtn.onclick = () => {
    if (pdfDoc) {
        pdfDoc.save('Salary Slip.pdf');
        modal.style.display = "none";
    }
};

salaryForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    try {
        // Check if jsPDF is loaded
        if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF !== 'function') {
            throw new Error('PDF generation library not loaded properly');
        }

        // Get form values
        const basicSalary = Number(document.getElementById('basicSalary').value) || 0;
        const hra = Number(document.getElementById('hra').value) || 0;
        const medicalAllowance = Number(document.getElementById('medicalAllowance').value) || 0;
        const specialAllowance = Number(document.getElementById('specialAllowance').value) || 0;
        const npsContribution = Number(document.getElementById('npsContribution').value) || 0;
        const gratuity = Number(document.getElementById('gratuity').value) || 0;
        const pli = Number(document.getElementById('pli').value) || 0;

        const providentFund = Number(document.getElementById('providentFund').value) || 0;
        const esi = Number(document.getElementById('esi').value) || 0;
        const tds = Number(document.getElementById('tds').value) || 0;
        const npsDeduction = Number(document.getElementById('npsDeduction').value) || 0;
        const professionalTax = Number(document.getElementById('professionalTax').value) || 0;

        // Get salary month and format it
        const salaryDate = document.getElementById('salaryMonth').value;
        if (!salaryDate) {
            throw new Error('Please select a salary month');
        }
        const date = new Date(salaryDate);
        const monthYear = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        const totalEarnings = basicSalary + hra + medicalAllowance + specialAllowance + 
                            npsContribution + gratuity + pli;
        const totalDeductions = providentFund + esi + tds + npsDeduction + professionalTax;
        const netSalary = totalEarnings - totalDeductions;

        if (netSalary < 0) {
            throw new Error('Net salary cannot be negative. Please check your deductions.');
        }

        // Format numbers to always show 2 decimal places
        const formatNumber = (num) => {
            return num.toFixed(2);
        };

        // Convert number to words
        function numberToWords(num) {
            const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
            const double = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            const formatTens = (num) => {
                if (num < 10) return single[num];
                if (num < 20) return double[num - 10];
                return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + single[num % 10] : '');
            };
            if (num === 0) return 'Zero';
            const convert = (num) => {
                if (num < 100) return formatTens(num);
                if (num < 1000) return single[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + formatTens(num % 100) : '');
                if (num < 100000) return convert(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + convert(num % 1000) : '');
                if (num < 10000000) return convert(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + convert(num % 100000) : '');
                return convert(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + convert(num % 10000000) : '');
            };
            return convert(num) + ' Only';
        }

        // Create PDF document
        const doc = new window.jspdf.jsPDF();

        // Set default font and line width
        doc.setFont('helvetica');
        doc.setLineWidth(0.1);

        // Company Logo
        doc.rect(15, 15, 35, 25); // Rectangle border for logo
        
        // Set bold black text for logo
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setFillColor(0, 0, 0);
        doc.setTextColor(0, 0, 0);
        
        // Draw logo text with extra bold effect
        const logoX = 20;
        ['TWO', 'EIGHT', 'ONE'].forEach((text, index) => {
            // Draw text multiple times with slight offset for bold effect
            for(let i = 0; i < 2; i++) {
                doc.text(text, logoX + i * 0.1, 23 + (index * 7));
            }
        });

        // Reset text color for rest of the document
        doc.setTextColor(0, 0, 0);
        
        // Company Header - centered alignment
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('28one Sourcing India Private Limited', 105, 25, { align: 'center' });
        
        // Company Address
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('270, Phase II, Udyog Vihar, Gurugram, Haryana, 122016', 105, 35, { align: 'center' });
        
        // Salary Slip Header
        doc.setFontSize(12);
        doc.text(`Salary Slip for the month of ${monthYear}`, 105, 45, { align: 'center' });

        // Employee Details
        doc.setFontSize(10);
        doc.rect(15, 55, 180, 42); // Adjusted height to include date of joining

        const employeeDetails = [
            ['Employee Name :', document.getElementById('name').value || 'Name of Employee'],
            ['Employee Code :', document.getElementById('employeeId').value || 'Emp. Code'],
            ['Department :', document.getElementById('department').value || 'Department'],
            ['Designation :', document.getElementById('designation').value || 'Designation'],
            ['Location :', document.getElementById('location').value || 'Location'],
            ['Date of Joining :', document.getElementById('dateOfJoining').value || 'DOJ']
        ];

        let yPos = 63;
        employeeDetails.forEach((detail, index) => {
            doc.text(detail[0], 20, yPos);
            doc.text(detail[1], 80, yPos);
            yPos += 6; // Reduced spacing between lines to fit all details
        });

        // Earnings and Deductions Table
        const startY = 107; // Moved up slightly to accommodate the employee details
        doc.rect(15, startY, 90, 10);
        doc.rect(105, startY, 90, 10);
        doc.setFont('helvetica', 'bold');
        doc.text('Earnings', 20, startY + 7);
        doc.text('Amount (INR)', 95, startY + 7, { align: 'right' });
        doc.text('Deductions', 110, startY + 7);
        doc.text('Amount (INR)', 185, startY + 7, { align: 'right' });

        // Table content
        doc.setFont('helvetica', 'normal');
        let currentY = startY + 10;
        const rowHeight = 7;

        // Earnings column
        const earnings = [
            ['Basic Salary', basicSalary],
            ['HRA', hra],
            ['Medical Allowance', medicalAllowance],
            ['Special Allowance', specialAllowance],
            ['NPS Contribution', npsContribution],
            ['Gratuity', gratuity],
            ['PLI', pli]
        ];

        // Deductions column
        const deductions = [
            ['Provident Fund', providentFund],
            ['ESI', esi],
            ['TDS/IT', tds],
            ['NPS Contribution (Employer Cont)', npsDeduction],
            ['Professional Tax', professionalTax]
        ];

        // Draw table rows
        const maxRows = Math.max(earnings.length, deductions.length);
        for (let i = 0; i < maxRows; i++) {
            doc.rect(15, currentY, 90, rowHeight);
            doc.rect(105, currentY, 90, rowHeight);
            
            if (earnings[i]) {
                doc.text(earnings[i][0], 20, currentY + 5);
                doc.text(formatNumber(earnings[i][1]), 95, currentY + 5, { align: 'right' });
            }
            
            if (deductions[i]) {
                doc.text(deductions[i][0], 110, currentY + 5);
                doc.text(formatNumber(deductions[i][1]), 185, currentY + 5, { align: 'right' });
            }
            
            currentY += rowHeight;
        }

        // Total row
        doc.setFont('helvetica', 'bold');
        doc.rect(15, currentY, 90, rowHeight);
        doc.rect(105, currentY, 90, rowHeight);
        doc.text('Gross Earning', 20, currentY + 5);
        doc.text(`${formatNumber(totalEarnings)}`, 95, currentY + 5, { align: 'right' });
        doc.text('Total Deduction', 110, currentY + 5);
        doc.text(`${formatNumber(totalDeductions)}`, 185, currentY + 5, { align: 'right' });

        // Net Salary row
        currentY += rowHeight;
        doc.rect(105, currentY, 90, rowHeight);
        doc.text('Net Salary', 110, currentY + 5);
        doc.text(`${formatNumber(netSalary)}`, 185, currentY + 5, { align: 'right' });

        // Amount in words
        currentY += rowHeight + 5;
        doc.setFont('helvetica', 'normal');
        doc.text('Amount (in words)', 20, currentY + 5);
        doc.text(numberToWords(Math.round(netSalary)), 60, currentY + 5);

        // Footer
        doc.setFontSize(8);
        doc.text('This is system generated statement and it does not require company seal and signature.', 105, currentY + 15, { align: 'center' });

        // Store PDF document for later use
        pdfDoc = doc;

        // Generate data URL for preview
        const pdfDataUri = doc.output('dataurlstring');
        
        // Show preview in modal
        const previewFrame = document.getElementById('pdfPreview');
        previewFrame.src = pdfDataUri;
        
        // Display modal
        modal.style.display = "block";

    } catch (error) {
        console.error('Error:', error);
        alert('Error generating salary slip: ' + error.message);
    }
});

