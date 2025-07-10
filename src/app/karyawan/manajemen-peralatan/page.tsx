
/*
  Sketch Arduino Mega 2560 untuk Batching Plant Controller
  Disesuaikan untuk membaca data dari Indikator Timbangan GSC SGW-3015S
  dan menerima perintah kontrol dari aplikasi web melalui program Agent.
*/

#include <ArduinoJson.h> // Library untuk JSON Parsing

// --- Konfigurasi Serial ---
// Serial: Terhubung ke Komputer (Agent) untuk menerima perintah & mengirim data berat.
// Serial1: Terhubung ke Indikator Timbangan GSC SGW-3015S (Pin 19-RX1, 18-TX1).
#define SERIAL_AGENT Serial
#define SERIAL_INDICATOR Serial1

// --- Konfigurasi Pin Relay (sesuai diskusi sebelumnya) ---
#define RELAY_PASIR1_PIN      22
#define RELAY_PASIR2_PIN      23
#define RELAY_BATU1_PIN       24
#define RELAY_BATU2_PIN       25
#define RELAY_AIR_TIMBANG_PIN 26
#define RELAY_AIR_BUANG_PIN   27
#define RELAY_SEMEN_TIMBANG_PIN 28
#define RELAY_SEMEN_BUANG_PIN   29
#define RELAY_PINTU_BUKA_PIN  30
#define RELAY_PINTU_TUTUP_PIN 31
#define RELAY_KONVEYOR_BAWAH_PIN 32
#define RELAY_KONVEYOR_ATAS_PIN  33
#define RELAY_KLAKSON_PIN     34
#define RELAY_SILO1_PIN       35
#define RELAY_SILO2_PIN       36
#define RELAY_SILO3_PIN       37
#define RELAY_SILO4_PIN       38
#define RELAY_SILO5_PIN       39
#define RELAY_SILO6_PIN       40

const int SILO_PINS[] = { RELAY_SILO1_PIN, RELAY_SILO2_PIN, RELAY_SILO3_PIN, RELAY_SILO4_PIN, RELAY_SILO5_PIN, RELAY_SILO6_PIN };
const int NUM_SILOS = sizeof(SILO_PINS) / sizeof(SILO_PINS[0]);
const size_t JSON_DOC_SIZE = 256;

void setup() {
  // Inisialisasi komunikasi serial ke komputer/agent
  SERIAL_AGENT.begin(9600);
  
  // Inisialisasi komunikasi serial ke indikator timbangan
  // Pastikan baud rate ini sama dengan pengaturan di GSC SGW-3015S Anda (default biasanya 9600)
  SERIAL_INDICATOR.begin(9600);

  SERIAL_AGENT.println("Inisialisasi semua pin relay...");

  // Daftar semua pin untuk inisialisasi yang lebih rapi
  const int ALL_RELAY_PINS[] = {
    RELAY_PASIR1_PIN, RELAY_PASIR2_PIN, RELAY_BATU1_PIN, RELAY_BATU2_PIN,
    RELAY_AIR_TIMBANG_PIN, RELAY_AIR_BUANG_PIN, RELAY_SEMEN_TIMBANG_PIN, RELAY_SEMEN_BUANG_PIN,
    RELAY_PINTU_BUKA_PIN, RELAY_PINTU_TUTUP_PIN, RELAY_KONVEYOR_BAWAH_PIN, RELAY_KONVEYOR_ATAS_PIN,
    RELAY_KLAKSON_PIN, RELAY_SILO1_PIN, RELAY_SILO2_PIN, RELAY_SILO3_PIN,
    RELAY_SILO4_PIN, RELAY_SILO5_PIN, RELAY_SILO6_PIN
  };

  // Inisialisasi semua pin sebagai OUTPUT dan set ke LOW
  // Asumsi: Relay adalah active-high (HIGH = ON, LOW = OFF)
  for (int pin : ALL_RELAY_PINS) {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
  }

  SERIAL_AGENT.println("Arduino Mega 2560 siap! Menunggu data dari indikator dan perintah dari agent...");
}

void loop() {
  // --- Bagian 1: Membaca data dari Indikator Timbangan (Serial1) ---
  if (SERIAL_INDICATOR.available()) {
    String dataFromIndicator = SERIAL_INDICATOR.readStringUntil('\n');
    dataFromIndicator.trim(); // Hapus spasi atau karakter tidak terlihat di awal/akhir

    // Parsing data dari format GSC "ST,GS,  123.45,kg"
    char dataBuffer[30];
    dataFromIndicator.toCharArray(dataBuffer, 30);
    
    char* token = strtok(dataBuffer, ","); // Token pertama (Status)
    token = strtok(NULL, ",");             // Token kedua (Tipe Berat)
    token = strtok(NULL, ",");             // Token ketiga (Nilai Berat)

    if (token != NULL) {
      float berat = atof(token); // Konversi string nilai berat ke float
      
      // Kirim data berat yang sudah diproses ke agent/komputer
      StaticJsonDocument<100> docWeight;
      docWeight["type"] = "weight"; // Memberitahu agent bahwa ini adalah data berat
      docWeight["value"] = berat;
      serializeJson(docWeight, SERIAL_AGENT);
      SERIAL_AGENT.println(); // Newline sebagai pemisah pesan
    }
  }

  // --- Bagian 2: Menerima perintah dari Agent (Serial) ---
  if (SERIAL_AGENT.available()) {
    String jsonString = SERIAL_AGENT.readStringUntil('\n');

    StaticJsonDocument<JSON_DOC_SIZE> docCommand;
    DeserializationError error = deserializeJson(docCommand, jsonString);

    if (error) {
      SERIAL_AGENT.print(F("deserializeJson() failed: "));
      SERIAL_AGENT.println(error.f_str());
      return;
    }

    const char* command = docCommand["command"];
    if (!command) return;

    if (strcmp(command, "SET_RELAY") == 0) {
      handleSetRelay(docCommand);
    } else if (strcmp(command, "SELECT_SILO") == 0) {
      handleSelectSilo(docCommand);
    }
    // Tambahkan 'else if' untuk perintah lain jika ada di masa depan
  }
}

// Fungsi untuk menangani perintah SET_RELAY
void handleSetRelay(JsonDocument& doc) {
  const char* relayId = doc["relayId"];
  bool state = doc["state"];
  if (!relayId) return;

  int targetPin = -1;

  if (strcmp(relayId, "pasir1") == 0) targetPin = RELAY_PASIR1_PIN;
  else if (strcmp(relayId, "pasir2") == 0) targetPin = RELAY_PASIR2_PIN;
  else if (strcmp(relayId, "batu1") == 0) targetPin = RELAY_BATU1_PIN;
  else if (strcmp(relayId, "batu2") == 0) targetPin = RELAY_BATU2_PIN;
  else if (strcmp(relayId, "airTimbang") == 0) targetPin = RELAY_AIR_TIMBANG_PIN;
  else if (strcmp(relayId, "airBuang") == 0) targetPin = RELAY_AIR_BUANG_PIN;
  else if (strcmp(relayId, "semenTimbang") == 0) targetPin = RELAY_SEMEN_TIMBANG_PIN;
  else if (strcmp(relayId, "semen") == 0) targetPin = RELAY_SEMEN_BUANG_PIN; // Disesuaikan dengan nama baru
  else if (strcmp(relayId, "pintuBuka") == 0) targetPin = RELAY_PINTU_BUKA_PIN;
  else if (strcmp(relayId, "pintuTutup") == 0) targetPin = RELAY_PINTU_TUTUP_PIN;
  else if (strcmp(relayId, "konveyorBawah") == 0) targetPin = RELAY_KONVEYOR_BAWAH_PIN;
  else if (strcmp(relayId, "konveyorAtas") == 0) targetPin = RELAY_KONVEYOR_ATAS_PIN;
  else if (strcmp(relayId, "klakson") == 0) targetPin = RELAY_KLAKSON_PIN;
  
  if (targetPin != -1) {
    digitalWrite(targetPin, state ? HIGH : LOW);
    // Optional: Kirim konfirmasi kembali ke agent
    // SERIAL_AGENT.print("OK: Relay "); SERIAL_AGENT.print(relayId); SERIAL_AGENT.println(state ? " ON" : " OFF");
  } else {
    // SERIAL_AGENT.print("Error: relayId tidak dikenal: "); SERIAL_AGENT.println(relayId);
  }
}

// Fungsi untuk menangani perintah SELECT_SILO
void handleSelectSilo(JsonDocument& doc) {
  const char* siloId = doc["siloId"];
  if (!siloId) return;

  int selectedSiloIndex = -1;

  if (strcmp(siloId, "silo1") == 0) selectedSiloIndex = 0;
  else if (strcmp(siloId, "silo2") == 0) selectedSiloIndex = 1;
  else if (strcmp(siloId, "silo3") == 0) selectedSiloIndex = 2;
  else if (strcmp(siloId, "silo4") == 0) selectedSiloIndex = 3;
  else if (strcmp(siloId, "silo5") == 0) selectedSiloIndex = 4;
  else if (strcmp(siloId, "silo6") == 0) selectedSiloIndex = 5;

  if (selectedSiloIndex != -1) {
    for (int i = 0; i < NUM_SILOS; i++) {
      digitalWrite(SILO_PINS[i], (i == selectedSiloIndex) ? HIGH : LOW);
    }
    // Optional: Kirim konfirmasi
    // SERIAL_AGENT.print("OK: Silo "); SERIAL_AGENT.print(siloId); SERIAL_AGENT.println(" selected.");
  }
}
