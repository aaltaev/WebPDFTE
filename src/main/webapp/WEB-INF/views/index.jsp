    <%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
    <jsp:include page="header.jsp"/>


    <script src='<c:url value="/static/js/libs/pdf.js"/>'></script>
    <script src='<c:url value="/static/js/selectpdfarea.js"/>'></script>

    <p class="lead text-justify">
        This is an early prototype of tool for table extraction from PDF documents.
        It does not detect tables, so it's necessary to specify the area from which
        you want to extract the table. Also, that tool can't do OCR, therefore
        scanned PDFs are not supported.
    </p>

    <form id="pdfform" name="pdfform" enctype="multipart/form-data" method="post">
        <div class="form-group">
            <h4>Choose PDF file</h4>
            <input type="file" id="inpdf" name="inpdf" accept=".pdf"
                   onchange="fileHandler()" style="display: none"/>
            <button type="button" class="btn btn-default" onclick="document.getElementById('inpdf').click()">
                Browse&hellip;</button>
            <label id="pdfLabel" for="inpdf">No file selected</label>
        </div>
        <div class="form-group">
            <button id="submitBtn" class="btn btn-primary" type="submit" disabled>Extract</button>
        </div>
        <div id="pdfformhidden"></div>
    </form>
    <div id="pdf" align="center"></div>
    <h4>Or try examples listed below</h4>
    <div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true">
        <c:forEach var="i" begin="1" end="10">

            <div class="panel panel-default">
                <div class="panel-heading" role="tab" id="heading<c:out value="${i}" />">
                    <h4 class="panel-title">
                        <a role="button" data-toggle="collapse" data-parent="#accordion" href="#collapse<c:out value="${i}" />"
                           aria-expanded="true" aria-controls="collapse<c:out value="${i}" />">
                            Example <c:out value="${i}" />
                        </a>
                    </h4>
                </div>
                <div id="collapse<c:out value="${i}" />" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading<c:out value="${i}" />">
                    <div class="panel-body" id="pb<c:out value="${i}" />">
                        <a id="link<c:out value="${i}" />" class="btn btn-primary" href="/pdfte/example?id=<c:out value="${i}" />">Try Example</a>
                        <canvas id="pdfcanvasex<c:out value="${i}" />">Обновите браузер</canvas>
                        <script>
                            loadExample("<c:out value="${i}" />");
                        </script>
                    </div>
                </div>
            </div>

        </c:forEach>

    <p class="lead text-justify">
        You may download more examples
        <a href="http://cells.icc.ru/files/datasets/Dataset-PDF-TE.zip">here</a>
    </p>
    <br>
    <jsp:include page="footer.jsp"/>
