package ru.cells.icc.webpdfte.data.dao;

import ru.cells.icc.webpdfte.data.model.Extraction;

import java.util.List;

public interface ExtractionDao {
    Extraction findById(Integer id);

    void save(Extraction extraction);

    void deleteById(Integer id);

    List<Extraction> findAllExtractions();
}
