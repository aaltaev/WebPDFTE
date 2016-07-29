package ru.cells.icc.webpdfte.web;

import CELLS_Project.extractor.Extractor;
import com.itextpdf.text.DocumentException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.ModelAndView;
import ru.cells.icc.webpdfte.data.model.Extraction;
import ru.cells.icc.webpdfte.data.service.ExtractionService;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;

@Controller
@RequestMapping(value = "/")
public class MainController {

    @Autowired
    ExtractionService extractionService;

    @RequestMapping(method = RequestMethod.GET)
    public String getMain() {
        return "index";
    }

    @RequestMapping(method = RequestMethod.POST)
    public ModelAndView extract(@RequestParam("inpdf") MultipartFile file, ModelAndView model,
                                HttpServletRequest request, HttpServletResponse response) {
        try {
            Extraction extraction = new Extraction();
            extraction.setPdfName(file.getOriginalFilename());
            extraction.performExtraction(file.getBytes(), getExtractorsArgsFrom(request));
            extractionService.saveExtraction(extraction);
            model.addObject("tables", extraction.getHtmlTable());
            model.addObject("extractionId", extraction.getId().toString());
            model.setViewName("htmlResult");
        } catch (IOException | DocumentException e) {
            model.setViewName("error");
        }
        return model;
    }

    private String[] getExtractorsArgsFrom(HttpServletRequest request) {
        Map<String, String[]> parameterMap = request.getParameterMap();
        String[] args = new String[parameterMap.size()];
        int i = 0;
        for (String s : parameterMap.keySet()) {
            args[i++] = parameterMap.get(s)[0].isEmpty() ? "0" : parameterMap.get(s)[0];
        }
        return args;
    }
}
