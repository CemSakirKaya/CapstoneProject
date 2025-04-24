package com.example.demo.service;

import com.example.demo.model.FlowchartResult;
import com.example.demo.model.ProcessStep;
import com.example.demo.model.ProcessType;

// iText
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

// Servlet ve IO
import jakarta.servlet.http.HttpServletResponse;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URL;

// Grafik & Pie Chart
import java.awt.Color;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PiePlot;
import org.jfree.data.general.DefaultPieDataset;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PdfReportService {

    public void generatePdf(HttpServletResponse response, FlowchartResult result)
            throws IOException, DocumentException, BadElementException {

        List<ProcessStep> steps = result.getSteps();
        int totalTime = result.getTotalTime();
        int totalDistance = result.getTotalDistance();
        double valueAddedRatio = result.getValueAddedRatio();
        double nonValueAddedRatio = result.getNonValueAddedRatio();

        Map<ProcessType, Integer> typeRatios = new HashMap<>();
        long total = steps.size();
        for (ProcessType type : ProcessType.values()) {
            long count = result.getTypeCounts().getOrDefault(type, 0L);
            int ratio = (int) ((double) count / total * 100);
            typeRatios.put(type, ratio);
        }

        Document document = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();

        // ✅ LOGO
        try {
            URL logoUrl = getClass().getClassLoader().getResource("static/logo.png");
            if (logoUrl != null) {
                Image logo = Image.getInstance(logoUrl);
                logo.scaleToFit(160, 80);
                logo.setAlignment(Image.ALIGN_CENTER);
                document.add(logo);
                document.add(new Paragraph(" "));
            }
        } catch (Exception e) {
            System.out.println("Logo yüklenemedi.");
        }

        // 📝 Başlık
        Font bold = new Font(Font.HELVETICA, 14, Font.BOLD);
        Paragraph title = new Paragraph("Flowchart Process Report", bold);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));

        // 🔷 Flow Table
        Font monoFont = new Font(Font.COURIER, 11);
        PdfPTable flowTable = new PdfPTable(4);
        flowTable.setWidthPercentage(100);
        flowTable.setWidths(new float[]{2, 2, 6, 10});

        flowTable.addCell(getHeaderCell("DIST. (ft)"));
        flowTable.addCell(getHeaderCell("TIME (min)"));
        flowTable.addCell(getHeaderCell("CHART SYMBOLS"));
        flowTable.addCell(getHeaderCell("PROCESS DESCRIPTION"));

        for (ProcessStep step : steps) {
            flowTable.addCell(String.valueOf(step.getDistance()));
            flowTable.addCell(String.valueOf(step.getTime()));

            PdfPCell symbolCell = new PdfPCell(new Paragraph(getOperationTypeRow(step.getType()) + "\n↓", monoFont));
            flowTable.addCell(symbolCell);
            flowTable.addCell(step.getDescription());
        }

        document.add(flowTable);
        document.add(new Paragraph(" "));

        // 📊 Pie chart image
        Image pieChartImage = getPieChartImage(valueAddedRatio, nonValueAddedRatio);
        pieChartImage.setAlignment(Image.ALIGN_CENTER);
        document.add(pieChartImage);
        document.add(new Paragraph(" "));

        // ✅ Totals
        PdfPTable totals = new PdfPTable(2);
        totals.setWidthPercentage(40);
        totals.addCell("Σ TIME");
        totals.addCell(String.valueOf(totalTime));
        totals.addCell("Σ DISTANCE");
        totals.addCell(String.valueOf(totalDistance));
        document.add(totals);
        document.add(new Paragraph(" "));

        // 🧮 Operation Type Ratios
        Paragraph ratioHeader = new Paragraph("Operation Type Ratios", bold);
        ratioHeader.setAlignment(Element.ALIGN_CENTER);
        document.add(new Paragraph(" "));
        document.add(ratioHeader);

        PdfPTable ratios = new PdfPTable(5);
        for (ProcessType type : ProcessType.values()) {
            ratios.addCell(type.name());
        }
        for (ProcessType type : ProcessType.values()) {
            ratios.addCell(typeRatios.getOrDefault(type, 0) + "%");
        }
        document.add(ratios);

        document.close();
    }

    // Pie Chart Oluştur
    private Image getPieChartImage(double valueAdded, double nonValueAdded)
            throws IOException, BadElementException {

        DefaultPieDataset<String> dataset = new DefaultPieDataset<>();
        dataset.setValue("Value-Added", valueAdded);
        dataset.setValue("Non-Value-Added", nonValueAdded);

        JFreeChart chart = ChartFactory.createPieChart(null, dataset, false, true, false);
        chart.setBackgroundPaint(null);

        PiePlot<?> plot = (PiePlot<?>) chart.getPlot();
        plot.setBackgroundPaint(null);
        plot.setOutlineVisible(false);

        plot.setSectionPaint("Value-Added", new Color(145, 174, 255)); // mavi
        plot.setSectionPaint("Non-Value-Added", new Color(255, 179, 128)); // turuncu

        BufferedImage chartImage = chart.createBufferedImage(250, 200);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(chartImage, "png", baos);
        baos.flush();

        return Image.getInstance(baos.toByteArray());
    }

    private PdfPCell getHeaderCell(String title) {
        Font boldFont = new Font(Font.HELVETICA, 12, Font.BOLD);
        PdfPCell cell = new PdfPCell(new Paragraph(title, boldFont));
        cell.setBackgroundColor(new Color(220, 220, 220));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }

    private String getOperationTypeRow(ProcessType selectedType) {
        StringBuilder symbols = new StringBuilder();
        for (ProcessType type : ProcessType.values()) {
            if (type == selectedType) {
                symbols.append(getFilledSymbol(type)).append(" ");
            } else {
                symbols.append(getEmptySymbol(type)).append(" ");
            }
        }
        return symbols.toString().trim();
    }

    private String getFilledSymbol(ProcessType type) {
        return switch (type) {
            case OPERATION -> "⬤";
            case TRANSPORTATION -> "▶";
            case DELAY -> "■";
            case STORAGE -> "◙";
            case INSPECTION -> "▼";
        };
    }

    private String getEmptySymbol(ProcessType type) {
        return switch (type) {
            case OPERATION -> "○";
            case TRANSPORTATION -> "▷";
            case DELAY -> "□";
            case STORAGE -> "◖";
            case INSPECTION -> "▽";
        };
    }
}
