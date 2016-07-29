package ru.cells.icc.webpdfte.data.dao;

import org.hibernate.Criteria;
import org.hibernate.criterion.Order;
import org.hibernate.criterion.Restrictions;
import org.springframework.stereotype.Repository;
import ru.cells.icc.webpdfte.data.model.Extraction;

import java.util.List;

@Repository("extractionDao")
public class ExtractionDaoImpl extends AbstractDao<Integer, Extraction> implements ExtractionDao {

    @Override
    public Extraction findById(Integer id) {
        return getByKey(id);
    }

    @Override
    public void save(Extraction extraction) {
        persist(extraction);
    }

    @Override
    public void deleteById(Integer id) {
        Criteria criteria = createEntityCriteria();
        criteria.add(Restrictions.eq("id", id));
        Extraction extraction = (Extraction) criteria.uniqueResult();
        delete(extraction);
    }

    @Override
    public List<Extraction> findAllExtractions() {
        Criteria criteria = createEntityCriteria().addOrder(Order.asc("extractionDate"));
        criteria.setResultTransformer(Criteria.DISTINCT_ROOT_ENTITY);
        List<Extraction> extractions = ((List<Extraction>) criteria.list());
        return extractions;
    }
}
