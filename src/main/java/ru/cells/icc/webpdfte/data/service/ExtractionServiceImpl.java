package ru.cells.icc.webpdfte.data.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.cells.icc.webpdfte.data.dao.ExtractionDao;
import ru.cells.icc.webpdfte.data.model.Extraction;

import java.util.List;

@Service("extractionService")
@Transactional
public class ExtractionServiceImpl implements ExtractionService {

    @Autowired
    ExtractionDao dao;

    @Override
    public Extraction findById(Integer id) {
        return dao.findById(id);
    }

    @Override
    public void saveExtraction(Extraction extraction) {
        dao.save(extraction);
    }

    @Override
    public List<Extraction> findAllExtractions() {
        return dao.findAllExtractions();
    }
}
