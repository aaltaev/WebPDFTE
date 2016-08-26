package ru.cells.icc.webpdfte.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import ru.cells.icc.webpdfte.data.model.Extraction;
import ru.cells.icc.webpdfte.data.service.ExtractionService;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Controller
@RequestMapping("/excel")
public class ExcelDownloadController {
    @Autowired
    ExtractionService extractionService;

    @RequestMapping(method = RequestMethod.GET)
    public void downloadExcel(@RequestParam("id") int id, HttpServletResponse response) {
        Extraction extraction = extractionService.findById(id);
        if (extraction != null) {
            response.setContentType("application/octet-stream");
            response.setHeader("Content-Disposition", "inline; filename=\"" + extraction.getPdfName() + ".xlsx\"");
            response.setContentLength(extraction.getExcelTable().length);
            try {
                response.getOutputStream().write(extraction.getExcelTable());
                response.getOutputStream().close();
            } catch (IOException e) {
                return;
            }
        }
    }
}
