	package com.example.demo.controller;
	
	import com.example.demo.model.FlowchartResult;
	import com.example.demo.service.PdfReportService;
	import com.lowagie.text.BadElementException;
	import com.lowagie.text.DocumentException;
	import jakarta.servlet.http.HttpServletResponse;
	import org.springframework.web.bind.annotation.*;
	
	import java.io.IOException;
	
	@RestController
	@RequestMapping("/api/report")
	public class PdfReportController {
	
	    private final PdfReportService pdfReportService;
	    private final FlowchartController flowchartController;
	
	    public PdfReportController(PdfReportService pdfReportService, FlowchartController flowchartController) {
	        this.pdfReportService = pdfReportService;
	        this.flowchartController = flowchartController;
	    }
	
	    @GetMapping("/pdf")
	    public void generatePdf(HttpServletResponse response)
	            throws IOException, DocumentException, BadElementException {
	
	        response.setContentType("application/pdf");
	        response.setHeader("Content-Disposition", "attachment; filename=FlowchartReport.pdf");
	
	        FlowchartResult result = flowchartController.getResult().getBody();
	        if (result == null || result.getSteps().isEmpty()) {
	            response.getWriter().write("No data available. Please add process steps.");
	            return;
	        }
	
	        pdfReportService.generatePdf(response, result);
	    }
	}
