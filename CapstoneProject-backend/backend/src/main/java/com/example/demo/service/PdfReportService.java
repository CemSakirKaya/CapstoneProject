package com.example.demo.service;

import com.example.demo.model.FlowchartResult;
import com.example.demo.model.ProcessStep;
import com.example.demo.model.ProcessType;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import jakarta.servlet.http.HttpServletResponse;
import org.jfree.chart.ChartFactory;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.plot.PiePlot;
import org.jfree.data.general.DefaultPieDataset;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.Color;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PdfReportService {

    public void generatePdf(HttpServletResponse response, FlowchartResult result)
            throws IOException, DocumentException {

        List<ProcessStep> steps = result.getSteps();
        int totalTime = result.getTotalTime();
        int totalDistance = result.getTotalDistance();

        long valueAddedCount = steps.stream()
                .filter(ProcessStep::isValueAdded)
                .count();

        double valueAddedRatio = ((double) valueAddedCount / steps.size()) * 100;
        double nonValueAddedRatio = 100.0 - valueAddedRatio;

        Map<ProcessType, Integer> typeRatios = new HashMap<>();
        long total = steps.size();
        for (ProcessType type : ProcessType.values()) {
            long count = result.getTypeCounts().getOrDefault(type, 0L);
            int ratio = (int) ((double) count / total * 100);
            typeRatios.put(type, ratio);
        }

        Document doc = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(doc, response.getOutputStream());
        doc.open();

        try {
            URL logoUrl = getClass().getClassLoader().getResource("static/logo.png");
            if (logoUrl != null) {
                Image logo = Image.getInstance(logoUrl);
                logo.scaleToFit(150, 60);
                logo.setAlignment(Image.ALIGN_CENTER);
                doc.add(logo);
                doc.add(new Paragraph(" "));
            }
        } catch (Exception e) {
            System.out.println("Logo yüklenemedi: " + e.getMessage());
        }

        Font bold = new Font(Font.HELVETICA, 16, Font.BOLD);
        Paragraph title = new Paragraph("Flowchart Process Report", bold);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);
        doc.add(new Paragraph(" "));

        
       
        Paragraph flowStepsTitle = new Paragraph("Flowchart Steps", bold);
        doc.add(flowStepsTitle);
        doc.add(new Paragraph(" "));

        PdfPTable flowTable = new PdfPTable(5);
        flowTable.setWidthPercentage(100);
        flowTable.setWidths(new float[]{2, 2, 6, 10, 4});
        flowTable.setKeepTogether(true);

        flowTable.addCell(getHeaderCell("DIST. (m)"));
        flowTable.addCell(getHeaderCell("TIME (min)"));
        flowTable.addCell(getHeaderCell("CHART SYMBOLS"));
        flowTable.addCell(getHeaderCell("PROCESS DESCRIPTION"));
        flowTable.addCell(getHeaderCell("VALUE ADDED"));

        for (ProcessStep step : steps) {
            flowTable.addCell(String.valueOf(step.getDistance()));
            flowTable.addCell(String.valueOf(step.getTime()));

            PdfPCell symbolCell = new PdfPCell();
            PdfPTable icons = new PdfPTable(5);
            icons.setWidths(new int[]{1, 1, 1, 1, 1});

            icons.addCell(step.getType() == ProcessType.OPERATION
                    ? getImageCell("static/operation_filled.png")
                    : getImageCell("static/operation_empty.png"));

            icons.addCell(step.getType() == ProcessType.TRANSPORTATION
                    ? getImageCell("static/transportation_filled.png")
                    : getImageCell("static/transportation_empty.png"));

            icons.addCell(step.getType() == ProcessType.INSPECTION
                    ? getImageCell("static/inspection_filled.png")
                    : getImageCell("static/inspection_empty.png"));

            icons.addCell(step.getType() == ProcessType.DELAY
                    ? getImageCell("static/delay_filled.png")
                    : getImageCell("static/delay_empty.png"));

            icons.addCell(step.getType() == ProcessType.STORAGE
                    ? getImageCell("static/storage_filled.png")
                    : getImageCell("static/storage_empty.png"));

            symbolCell.addElement(icons);
            flowTable.addCell(symbolCell);
            flowTable.addCell(step.getDescription());
            flowTable.addCell(step.isValueAdded() ? "Value Added" : "Non-Value Added");
        }

        doc.add(flowTable);
        doc.add(new Paragraph(" "));

        Paragraph chartTitle = new Paragraph("Value-Added vs Non-Value-Added Chart", bold);
        doc.add(chartTitle);
        doc.add(new Paragraph(" "));

        Image pieChartImage = createPieChart(valueAddedRatio, nonValueAddedRatio);
        pieChartImage.setAlignment(Image.ALIGN_CENTER);
        doc.add(pieChartImage);
        doc.add(new Paragraph(" "));

        Paragraph totalTitle = new Paragraph("Total Summary", bold);
        doc.add(totalTitle);
        doc.add(new Paragraph(" "));

        PdfPTable totalTable = new PdfPTable(2);
        totalTable.setWidthPercentage(30);
        totalTable.setKeepTogether(true);
        totalTable.addCell("TOTAL TIME");
        totalTable.addCell(String.valueOf(totalTime));
        totalTable.addCell("TOTAL DISTANCE");
        totalTable.addCell(String.valueOf(totalDistance));
        doc.add(totalTable);
        doc.add(new Paragraph(" "));


        Paragraph ratioHeader = new Paragraph("Operation Type Ratios", bold);
        ratioHeader.setAlignment(Element.ALIGN_CENTER);
        ratioHeader.setKeepTogether(true);
        doc.add(ratioHeader);
        doc.add(new Paragraph(" "));

        PdfPTable ratios = new PdfPTable(5);
        ratios.setKeepTogether(true);
        for (ProcessType type : ProcessType.values()) {
            ratios.addCell(type.name());
        }
        for (ProcessType type : ProcessType.values()) {
            ratios.addCell(typeRatios.getOrDefault(type, 0) + "%");
        }

        doc.add(ratios);
        doc.close();
    }

    private PdfPCell getHeaderCell(String title) {
        Font font = new Font(Font.HELVETICA, 12, Font.BOLD);
        PdfPCell cell = new PdfPCell(new Paragraph(title, font));
        cell.setBackgroundColor(new Color(220, 220, 220));
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        return cell;
    }

    private PdfPCell getImageCell(String path) {
        try {
            URL imgUrl = getClass().getClassLoader().getResource(path);
            if (imgUrl != null) {
                Image icon = Image.getInstance(imgUrl);
                icon.scaleToFit(12, 12);
                PdfPCell cell = new PdfPCell(icon, false);
                cell.setBorder(Rectangle.NO_BORDER);
                return cell;
            }
        } catch (Exception e) {
        }
        PdfPCell placeholder = new PdfPCell(new Phrase(" "));
        placeholder.setBorder(Rectangle.NO_BORDER);
        return placeholder;
    }

    private Image createPieChart(double valueAdded, double nonValueAdded)
            throws IOException, BadElementException {

        String valueAddedLabel = "Value-Added (" + Math.round(valueAdded) + "%)";
        String nonValueAddedLabel = "Non-Value-Added (" + Math.round(nonValueAdded) + "%)";

        DefaultPieDataset<String> dataset = new DefaultPieDataset<>();
        dataset.setValue(valueAddedLabel, valueAdded);
        dataset.setValue(nonValueAddedLabel, nonValueAdded);

        JFreeChart chart = ChartFactory.createPieChart(null, dataset, false, true, false);
        chart.setBackgroundPaint(Color.WHITE);

        PiePlot<?> plot = (PiePlot<?>) chart.getPlot();
        plot.setBackgroundPaint(Color.WHITE);
        plot.setOutlineVisible(false);
        plot.setInteriorGap(0.4);
        plot.setCircular(true);

        plot.setSectionPaint(valueAddedLabel, new Color(192, 192, 192));      
        plot.setSectionPaint(nonValueAddedLabel, new Color(112, 112, 112));   

        plot.setLabelBackgroundPaint(Color.WHITE);
        plot.setLabelPaint(Color.BLACK);
        plot.setLabelOutlinePaint(null);
        plot.setLabelShadowPaint(null);

        BufferedImage chartImage = chart.createBufferedImage(330, 255); 
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(chartImage, "png", baos);
        baos.flush();
        return Image.getInstance(baos.toByteArray());
    }
}
