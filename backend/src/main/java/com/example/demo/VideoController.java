package com.example.demo;


import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/video")
public class VideoController {

    private static final String UPLOAD_DIR = "uploads";
    private final List<String> uploadedVideos = new ArrayList<>(); // Geçici video listesi

    @PostMapping("/upload")
    public ResponseEntity<?> uploadVideo(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "link", required = false) String link) {

        if (file != null && !file.isEmpty()) {
            try {
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }

                File savedFile = new File(uploadDir, file.getOriginalFilename());
                file.transferTo(savedFile);

                // Listeye ekle
                uploadedVideos.add(savedFile.getAbsolutePath());

                return ResponseEntity.ok().body("{\"message\": \"Video başarıyla yüklendi\", \"path\": \"" + savedFile.getAbsolutePath() + "\"}");
            } catch (IOException e) {
                return ResponseEntity.status(500).body("{\"error\": \"Dosya yüklenirken hata oluştu\"}");
            }
        }

        if (link != null && !link.isEmpty()) {
            uploadedVideos.add(link);
            return ResponseEntity.ok().body("{\"message\": \"YouTube videosu kaydedildi\", \"link\": \"" + link + "\"}");
        }

        return ResponseEntity.badRequest().body("{\"error\": \"Lütfen bir video veya link ekleyin\"}");
    }

    @GetMapping("/list")
    public ResponseEntity<List<String>> listVideos() {
        return ResponseEntity.ok(uploadedVideos);
    }
}
