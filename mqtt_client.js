var mqtt = require('mqtt');

// การตั้งค่าการเชื่อมต่อ MQTT Broker
const MQTT_SERVER = process.env.MQTT_SERVER || "206.189.38.17";
const MQTT_PORT = process.env.MQTT_PORT || "1884";
const MQTT_USER = process.env.MQTT_USER || "mqtt";
const MQTT_PASSWORD = process.env.MQTT_PASSWORD || "password";

// เชื่อมต่อกับ MQTT Broker
var client_junior = mqtt.connect({
    host: MQTT_SERVER,
    port: MQTT_PORT,
    username: MQTT_USER,
    password: MQTT_PASSWORD
});

// ฟังก์ชันแปลงข้อความเป็น Binary String
function toBinaryString(message) {
    const buffer = Buffer.from(message, 'utf8'); // แปลงข้อความเป็น Buffer
    return buffer.toString('binary'); // แปลง Buffer เป็น Binary String
}

// ฟังก์ชันแปลงข้อความเป็น Binary (Base 2)
function toBinaryBase2(message) {
    return Array.from(message)
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0')) // แปลงแต่ละตัวอักษรเป็น Base 2
        .join(' '); // รวมตัวเลขเป็นข้อความเดียว
}

// ตรวจจับข้อความเมื่อได้รับจาก MQTT
client_junior.on('connect', function () {
    console.log("MQTT Connected");
    client_junior.subscribe('encrypt/text', function (err) {
        if (!err) {
            console.log("Subscribed to topic: encrypt/text");
        } else {
            console.error("Subscription error: ", err);
        }
    });
});

client_junior.on('message', function (topic, message) {
    console.log(`\nReceived message from topic ${topic}: ${message.toString()}`);

    // แปลงข้อความเป็น Binary String
    const binaryString = toBinaryString(message.toString());
    console.log("Binary String:", binaryString);

    // แปลงข้อความเป็น Binary (Base 2)
    const binaryBase2 = toBinaryBase2(message.toString());
    console.log("Binary (Base 2):", binaryBase2);

    // ส่งผลลัพธ์กลับไปยัง MQTT Broker
    const resultTopic = "result/sukit";
    const resultMessage = JSON.stringify({
        original: message.toString(),
        binaryString: binaryString,
        binaryBase2: binaryBase2
    });

    client_junior.publish(resultTopic, resultMessage, function (err) {
        if (!err) {
            console.log(`Result published to topic ${resultTopic}:`, resultMessage);
        } else {
            console.error("Failed to publish result:", err);
        }
    });
});

// จัดการข้อผิดพลาด
client_junior.on('error', function (error) {
    console.error("MQTT Error: ", error);
});
