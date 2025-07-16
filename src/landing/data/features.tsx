import React from 'react';
import { Clock, Users, Calendar, Shield } from 'lucide-react';

export const features = [
  {
    icon: <Clock className="w-8 h-8 text-blue-600" />,
    title: "Akıllı Vardiya Planlama",
    description: "Yapay zeka destekli otomatik vardiya oluşturma ve optimizasyon"
  },
  {
    icon: <Users className="w-8 h-8 text-green-600" />,
    title: "Personel Yönetimi",
    description: "Kapsamlı personel takibi, izin yönetimi ve performans analizi"
  },
  {
    icon: <Calendar className="w-8 h-8 text-purple-600" />,
    title: "Esnek Takvim",
    description: "Özelleştirilebilir takvim görünümleri ve mobil erişim"
  },
  {
    icon: <Shield className="w-8 h-8 text-red-600" />,
    title: "Güvenli Altyapı",
    description: "256-bit SSL şifreleme ve KVKK uyumlu veri koruma"
  }
]; 