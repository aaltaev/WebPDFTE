package ru.cells.icc.webpdfte.web;

import com.itextpdf.text.DocumentException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import ru.cells.icc.webpdfte.data.model.Extraction;
import ru.cells.icc.webpdfte.data.service.ExtractionService;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

@Controller
@RequestMapping("/example")
public class ExampleController {

    @Autowired
    ExtractionService extractionService;

    @RequestMapping(method = RequestMethod.GET)
    public ModelAndView processExample(HttpServletRequest request, ModelAndView model) {
        try {
            String exampleId = request.getParameter("id");
            FileInputStream inputStream = new FileInputStream(new File(request.getSession().getServletContext()
                    .getRealPath("/static/examples/" + exampleId + ".pdf")));

            byte[] bytes = new byte[inputStream.available()];
            inputStream.read(bytes);

            Extraction extraction = new Extraction();
            extraction.setPdfName(exampleId + ".pdf");
            extraction.performExtraction(bytes, new String[]{
                    request.getParameter("x1"),
                    request.getParameter("y1"),
                    request.getParameter("x2"),
                    request.getParameter("y2")
            });
            extractionService.saveExtraction(extraction);
            model.addObject("tables", extraction.getHtmlTable());
            model.addObject("extractionId", extraction.getId().toString());
            model.setViewName("htmlResult");
        } catch (IOException | DocumentException e) {
            model.setViewName("error");
        }
        return model;
    }
}
