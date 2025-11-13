import React, { useContext } from 'react';
import { jsPDF } from 'jspdf';
import { AppContext } from '../../contexts/AppContext';

interface ExportButtonsProps {
    content: string;
    title: string;
    isJson?: boolean;
    htmlContent?: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ content, title, isJson, htmlContent }) => {
    const { userRole } = useContext(AppContext)!;

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
            reportElement.innerHTML = htmlContent;
            reportElement.style.position = 'absolute';
            reportElement.style.left = '-2999px';
            document.body.appendChild(reportElement);
            
            doc.html(reportElement, {
                callback: function (doc) {
                    document.body.removeChild(reportElement);
                    doc.save(`${title.replace(/ /g, '_')}.pdf`);
                },
                margin: [15, 15, 15, 15],
                autoPaging: 'slice',
                html2canvas: { scale: 0.25 }
            });

        } else {
            const doc = new jsPDF();
            doc.text(title, 10, 10);
            const text = isJson ? JSON.stringify(JSON.parse(content), null, 2) : content;
            doc.text(text, 10, 20, { maxWidth: 180 });
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
            <span className="text-xs text-slate-500 font-semibold">EXPORT (ADMIN):</span>
            <button onClick={handlePdf} className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-red-700 transition-colors" title="Export as PDF">PDF</button>
            <button onClick={handleWord} className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-blue-700 transition-colors" title="Export as Word">Word</button>
            <button onClick={handleTxt} className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-gray-600 transition-colors" title="Export as Text">TXT</button>
        </div>
    );
};
export default ExportButtons;
