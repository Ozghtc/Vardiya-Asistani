import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import NobetNavigation from './NobetNavigation';
import { useNavigate } from 'react-router-dom';

const NobetEkrani: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthName = currentMonth.toLocaleString('tr-TR', {
    month: 'long',
    year: 'numeric'
  });

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
  };

  const renderCalendar = () => {
    const days = [];
    const paddingDays = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    // Add padding days
    for (let i = 0; i < paddingDays; i++) {
      days.push(<div key={`padding-${i}`} className="p-4 text-gray-400"></div>);
    }

    // Add month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate?.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`p-4 border cursor-pointer transition-colors relative min-h-[100px]
            ${isSelected ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}
            ${isToday ? 'font-bold' : ''}
          `}
        >
          <span className="absolute top-2 right-2">{day}</span>
          {/* Nöbet bilgileri buraya eklenecek */}
        </div>
      );
    }

    return days;
  };

  return (
    <div>
      <NobetNavigation />
      <div className="flex justify-end mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-blue-600 transition shadow-sm"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Geri</span>
        </button>
      </div>
      <div className="p-6 bg-white rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            Nöbet Takvimi
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-lg font-medium">{monthName}</span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map((day) => (
            <div key={day} className="p-4 text-center font-medium bg-white">
              {day}
            </div>
          ))}
          {renderCalendar()}
        </div>
      </div>
    </div>
  );
};

export default NobetEkrani;