/*
  Lightweight WebSocket Server for ESP32 Arduino Core
  Zero external library dependency (RFC 6455 compliant)
*/
#ifndef MIN_WEBSOCKETS_H
#define MIN_WEBSOCKETS_H

#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <WiFiServer.h>
#include "mbedtls/sha1.h"
#include "mbedtls/base64.h"

#define MAX_WS_CLIENTS 4

class MinWebSocketServer {
public:
    MinWebSocketServer(uint16_t port = 81) : _server(port), _port(port) {}

    void begin() {
        _server.begin();
        for (int i = 0; i < MAX_WS_CLIENTS; i++) {
            _active[i] = false;
        }
    }

    void loop() {
        // Check for new incoming client connections
        if (_server.hasClient()) {
            WiFiClient newClient = _server.available();
            int slot = -1;
            for (int i = 0; i < MAX_WS_CLIENTS; i++) {
                if (!_active[i] || !_clients[i].connected()) {
                    slot = i;
                    break;
                }
            }
            if (slot >= 0) {
                _clients[slot] = newClient;
                _active[slot] = true;
                _handshaked[slot] = false;
            } else {
                newClient.stop();
            }
        }

        // Process clients
        for (int i = 0; i < MAX_WS_CLIENTS; i++) {
            if (_active[i]) {
                if (!_clients[i].connected()) {
                    _clients[i].stop();
                    _active[i] = false;
                    _handshaked[i] = false;
                    continue;
                }

                if (!_handshaked[i]) {
                    if (_clients[i].available()) {
                        handleHandshake(i);
                    }
                } else {
                    // Flush incoming frames if any
                    while (_clients[i].available()) {
                        _clients[i].read();
                    }
                }
            }
        }
    }

    void broadcastTXT(const String &payload) {
        broadcastTXT((const uint8_t*)payload.c_str(), payload.length());
    }

    void broadcastTXT(const uint8_t *payload, size_t len) {
        for (int i = 0; i < MAX_WS_CLIENTS; i++) {
            if (_active[i] && _handshaked[i] && _clients[i].connected()) {
                sendFrame(i, 0x01, payload, len);
            }
        }
    }

    int countClients() {
        int c = 0;
        for (int i = 0; i < MAX_WS_CLIENTS; i++) {
            if (_active[i] && _handshaked[i] && _clients[i].connected()) c++;
        }
        return c;
    }

private:
    WiFiServer _server;
    uint16_t _port;
    WiFiClient _clients[MAX_WS_CLIENTS];
    bool _active[MAX_WS_CLIENTS];
    bool _handshaked[MAX_WS_CLIENTS];

    void handleHandshake(int slot) {
        String req = "";
        while (_clients[slot].available()) {
            char c = _clients[slot].read();
            req += c;
            if (req.endsWith("\r\n\r\n")) break;
        }

        int keyIdx = req.indexOf("Sec-WebSocket-Key: ");
        if (keyIdx < 0) return;

        keyIdx += 19;
        int keyEnd = req.indexOf("\r\n", keyIdx);
        if (keyEnd < 0) return;

        String clientKey = req.substring(keyIdx, keyEnd);
        clientKey.trim();

        // RFC 6455 GUID: 258EAFA5-E914-47DA-95CA-C5AB0DC85B11
        String acceptInput = clientKey + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

        unsigned char sha1Result[20];
        mbedtls_sha1_context ctx;
        mbedtls_sha1_init(&ctx);
        mbedtls_sha1_starts(&ctx);
        mbedtls_sha1_update(&ctx, (const unsigned char*)acceptInput.c_str(), acceptInput.length());
        mbedtls_sha1_finish(&ctx, sha1Result);
        mbedtls_sha1_free(&ctx);

        unsigned char base64Result[32];
        size_t b64Len = 0;
        mbedtls_base64_encode(base64Result, sizeof(base64Result), &b64Len, sha1Result, 20);
        base64Result[b64Len] = '\0';

        String resp = "HTTP/1.1 101 Switching Protocols\r\n";
        resp += "Upgrade: websocket\r\n";
        resp += "Connection: Upgrade\r\n";
        resp += "Sec-WebSocket-Accept: " + String((char*)base64Result) + "\r\n\r\n";

        _clients[slot].print(resp);
        _clients[slot].flush();
        _handshaked[slot] = true;
    }

    void sendFrame(int slot, uint8_t opcode, const uint8_t *payload, size_t len) {
        uint8_t header[10];
        size_t hLen = 0;

        header[0] = 0x80 | (opcode & 0x0F); // FIN=1, Opcode
        if (len <= 125) {
            header[1] = (uint8_t)len;
            hLen = 2;
        } else if (len <= 65535) {
            header[1] = 126;
            header[2] = (len >> 8) & 0xFF;
            header[3] = len & 0xFF;
            hLen = 4;
        } else {
            header[1] = 127;
            for (int i = 0; i < 4; i++) header[2 + i] = 0;
            header[6] = (len >> 24) & 0xFF;
            header[7] = (len >> 16) & 0xFF;
            header[8] = (len >> 8) & 0xFF;
            header[9] = len & 0xFF;
            hLen = 10;
        }

        _clients[slot].write(header, hLen);
        if (len > 0 && payload != nullptr) {
            _clients[slot].write(payload, len);
        }
        _clients[slot].flush();
    }
};

#endif
