package ru.cells.icc.webpdfte.configuration;

import org.springframework.web.filter.CharacterEncodingFilter;
import org.springframework.web.servlet.support.AbstractAnnotationConfigDispatcherServletInitializer;

import javax.servlet.*;
import java.nio.charset.StandardCharsets;

public class AppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {
    @Override
    protected Class<?>[] getRootConfigClasses() {
        return new Class<?>[]{RootConfig.class, HibernateConfig.class};
    }

    @Override
    protected Class<?>[] getServletConfigClasses() {
        return new Class<?>[]{WebConfig.class};
    }

    @Override
    protected String[] getServletMappings() {
        return new String[]{"/"};
    }

    @Override
    protected Filter[] getServletFilters() {
        CharacterEncodingFilter filter = new CharacterEncodingFilter();
        filter.setEncoding(StandardCharsets.UTF_8.name());
        filter.setForceEncoding(true);
        return new Filter[]{filter};
    }

    @Override
    protected void customizeRegistration(ServletRegistration.Dynamic registration) {
        registration.setMultipartConfig(getMultipartConfigElement());
    }

    private MultipartConfigElement getMultipartConfigElement() {
        return new MultipartConfigElement("/home/upload", 1024 * 1024 * 50, 1024 * 1024 * 50, 0);
    }
}
