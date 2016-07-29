package ru.cells.icc.webpdfte.data.service;

import ru.cells.icc.webpdfte.data.model.Extraction;

import java.util.List;

public interface ExtractionService {
    Extraction findById(Integer id);

    void saveExtraction(Extraction extraction);

    List<Extraction> findAllExtractions();
}
