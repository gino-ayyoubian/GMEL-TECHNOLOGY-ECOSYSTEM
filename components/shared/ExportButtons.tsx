
import React, { useContext } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas'; // Import html2canvas to ensure it's available
import { AppContext } from '../src/contexts/AppContext';

interface ExportButtonsProps {
    content: string;
    title: string;
    isJson?: boolean;
    htmlContent?: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ content, title, isJson, htmlContent }) => {
    const { userRole } = useContext(AppContext)!;

    // Strict Role Check: Only Admin can see/use export buttons
    if (userRole !== 'admin') {
        return null;
    }

    const handlePdf = () => {
        if (htmlContent) {
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });
            const reportElement = document.createElement('div');
            reportElement.style.width = '210mm';
            reportElement.style.padding = '15mm';
            reportElement.style.fontFamily = 'Arial, sans-serif';
            reportElement.innerHTML = htmlContent;
            reportElement.style.position = 'absolute';
            reportElement.style.left = '-9999px';
            reportElement.style.top = '0';
            // Ensure background for readability in PDF
            reportElement.style.backgroundColor = '#ffffff';
            reportElement.style.color = '#000000';
            
            document.body.appendChild(reportElement);
            
            doc.html(reportElement, {
                callback: function (doc) {
                    document.body.removeChild(reportElement);
                    doc.save(`${title.replace(/ /g, '_')}.pdf`);
                },
                margin: [10, 10, 10, 10],
                autoPaging: 'text',
                html2canvas: {
                    scale: 0.25, // Scale down to fit A4 width nicely with standard CSS pixels
                    useCORS: true,
                    logging: false
                }
            });

        } else {
            const doc = new jsPDF();
            doc.setFontSize(14);
            doc.text(title.replace(/_/g, ' '), 10, 15);
            
            doc.setFontSize(10);
            const text = isJson ? JSON.stringify(JSON.parse(content), null, 2) : content;
            
            // Split text to fit page width
            const splitText = doc.splitTextToSize(text, 180);
            
            let y = 25;
            const pageHeight = doc.internal.pageSize.height;
            
            splitText.forEach((line: string) => {
                if (y > pageHeight - 10) {
                    doc.addPage();
                    y = 15;
                }
                doc.text(line, 10, y);
                y += 5;
            });
            
            doc.save(`${title.replace(/ /g, '_')}.pdf`);
        }
    };

    const handleTxt = () => {
        const text = isJson ? JSON.stringify(JSON.parse(content), null, 2) : content;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title.replace(/ /g, '_')}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleWord = () => {
        const finalHtml = htmlContent || `<p>${content.replace(/\n/g, '<br>')}</p>`;
        const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
            "xmlns:w='urn:schemas-microsoft-com:office:word' "+
            "xmlns='http://www.w3.org/TR/REC-html40'>"+
            "<head><meta charset='utf-8'><title>Export HTML to Word</title></head><body>";
        const footer = "</body></html>";
        const sourceHTML = header + finalHtml + footer;

        const blob = new Blob([sourceHTML], { type: 'application/vnd.ms-word' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${title.replace(/ /g, '_')}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-2">Export:</span>
            <button onClick={handlePdf} className="px-3 py-1.5 text-xs font-medium rounded bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white border border-slate-600 transition-colors" title="Export as PDF">PDF</button>
            <button onClick={handleWord} className="px-3 py-1.5 text-xs font-medium rounded bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white border border-slate-600 transition-colors" title="Export as Word">DOC</button>
            <button onClick={handleTxt} className="px-3 py-1.5 text-xs font-medium rounded bg-slate-700 hover:bg-slate-600 text-slate-200 hover:text-white border border-slate-600 transition-colors" title="Export as Text">TXT</button>
        </div>
    );
};
export default ExportButtons;
