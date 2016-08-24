package ru.cells.icc.webpdfte.data.model;

import CELLS_Project.extractor.Extractor;
import com.itextpdf.text.DocumentException;
import org.hibernate.validator.constraints.NotEmpty;

import javax.persistence.*;
import java.io.IOException;
import java.util.Arrays;
import java.util.Date;

@Entity
@Table(name = "EXTRACTIONS")
public class Extraction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotEmpty
    @Column(name = "PDF_NAME", nullable = false)
    private String pdfName;

    @NotEmpty
    @Column(name = "HTML_TABLE", nullable = false, columnDefinition = "text")
    private String htmlTable;

    @Lob
    @Column(name = "EXCEL_TABLE", nullable = false)
    private byte[] excelTable;

    @Lob
    @Column(name = "PDF_FILE", nullable = false)
    private byte[] pdfFile;

    @Temporal(TemporalType.DATE)
    @Column(name = "EXTRACTION_DATE", nullable = false)
    private Date extractionDate = new Date();

    @Temporal(TemporalType.TIME)
    @Column(name = "EXTRACTION_TIME", nullable = false)
    private Date extractionTime = new Date();

    public void performExtraction(byte[] pdf, String[] args) throws IOException, DocumentException {
        setPdfFile(pdf);

        Extractor extractor = new Extractor(pdf, 0.9, 1.0, args);
        extractor.extractTable();
        extractor.closePdf();

        setHtmlTable(extractor.getHtmlResult());
        setExcelTable(extractor.getExcelByteResult());
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getPdfName() {
        return pdfName;
    }

    public void setPdfName(String pdfName) {
        this.pdfName = pdfName;
    }

    public String getHtmlTable() {
        return htmlTable;
    }

    public void setHtmlTable(String htmlTable) {
        this.htmlTable = htmlTable;
    }

    public byte[] getExcelTable() {
        return excelTable;
    }

    public void setExcelTable(byte[] excelTable) {
        this.excelTable = excelTable;
    }

    public byte[] getPdfFile() {
        return pdfFile;
    }

    public void setPdfFile(byte[] pdfFile) {
        this.pdfFile = pdfFile;
    }

    public Date getExtractionDate() {
        return extractionDate;
    }

    public void setExtractionDate(Date extractionDate) {
        this.extractionDate = extractionDate;
    }

    public Date getExtractionTime() {
        return extractionTime;
    }

    public void setExtractionTime(Date extractionTime) {
        this.extractionTime = extractionTime;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;

        Extraction that = (Extraction) o;

        if (id != null ? !id.equals(that.id) : that.id != null) return false;
        if (pdfName != null ? !pdfName.equals(that.pdfName) : that.pdfName != null) return false;
        if (htmlTable != null ? !htmlTable.equals(that.htmlTable) : that.htmlTable != null) return false;
        if (!Arrays.equals(excelTable, that.excelTable)) return false;
        if (!Arrays.equals(pdfFile, that.pdfFile)) return false;
        if (extractionDate != null ? !extractionDate.equals(that.extractionDate) : that.extractionDate != null)
            return false;
        return extractionTime != null ? extractionTime.equals(that.extractionTime) : that.extractionTime == null;

    }

    @Override
    public int hashCode() {
        int result = id != null ? id.hashCode() : 0;
        result = 31 * result + (pdfName != null ? pdfName.hashCode() : 0);
        result = 31 * result + (extractionDate != null ? extractionDate.hashCode() : 0);
        result = 31 * result + (extractionTime != null ? extractionTime.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "Extraction{" +
                "id=" + id +
                ", pdfName='" + pdfName + '\'' +
                ", extractionDate=" + extractionDate +
                ", extractionTime=" + extractionTime +
                '}';
    }
}
