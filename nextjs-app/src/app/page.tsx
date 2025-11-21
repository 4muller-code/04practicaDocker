"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; // Ensure Badge accepts children correctly
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Users, Globe, ChevronRight, Star, Building, Headphones, Smartphone } from "lucide-react";
type Lang = "ca" | "es" | "en";
interface InfoCard { title: string; desc: string; }
interface Footer {
  addressTitle: string;
  address: string;
  hoursTitle: string;
  hours: string;
  contactTitle: string;
  contact: string;
  infoTitle: string;
  infoList: string[];
  copyright: string;
}
interface Translation {
  title: string;
  subtitle: string;
  heroTitle: string;
  heroDesc: string;
  monument: string;
  open: string;
  selectTicket: string;
  selectDesc: string;
  completeBooking: string;
  selectDate: string;
  selectTime: string;
  selectVisitors: string;
  adults: string;
  adultsDesc: string;
  children: string;
  childrenDesc: string;
  total: string;
  bookNow: string;
  cancel: string;
  infoCards: InfoCard[];
  footer: Footer;
}

const translations: Record<Lang, Translation> = {
  ca: {
    title: "Catedral de Mallorca",
    subtitle: "Catedral de Mallorca",
    heroTitle: "Descobreix la Catedral de Mallorca",
    heroDesc: "Reserva la teva entrada a la obra mestra gòtica. Una experiència única al cor de Palma.",
    monument: "Monument Històric",
    open: "Obert tots els dies",
    selectTicket: "Selecciona la teva entrada",
    selectDesc: "Escull entre les nostres diferents opcions de visita",
    completeBooking: "Completa la teva reserva",
    selectDate: "Selecciona una data",
    selectTime: "Selecciona l'hora d'entrada",
    selectVisitors: "Selecciona la data, hora i nombre de visitants",
    adults: "Adults",
    adultsDesc: "Més de 11 anys",
    children: "Nens",
    childrenDesc: "0-11 anys (30% descompte)",
    total: "Total",
    bookNow: "Reservar ara",
    cancel: "Cancel·lació gratuïta fins a 24 hores abans de la visita",
    infoCards: [
      { title: "Audioguies disponibles", desc: "Disponibles en 16 idiomes diferents per a una experiència completa" },
      { title: "Entrada digital", desc: "Presenta la teva entrada directament des del teu mòbil" },
      { title: "Accés prioritari", desc: "Evita les cues amb el nostre sistema de reserves en línia" }
    ],
    footer: {
      addressTitle: "Catedral de Mallorca",
      address: "Plaça de la Seu, s/n\n07001 Palma, España",
      hoursTitle: "Horaris",
      hours: "Dilluns - Diumenge\n09:00 - 18:00",
      contactTitle: "Contacte",
      contact: "Tel: +34 971 71 31 33\ninfo@catedraldemallorca.org",
      infoTitle: "Informació",
      infoList: ["Preguntes freqüents", "Política de cancel·lació", "Accessibilitat", "Contacte"],
      copyright: "© 2025 Catedral de Mallorca. Tots els drets reservats."
    }
  },
  es: {
    title: "Catedral de Mallorca",
    subtitle: "Catedral de Mallorca",
    heroTitle: "Descubre la Catedral de Mallorca",
    heroDesc: "Reserva tu entrada a la obra maestra gótica. Una experiencia única en el corazón de Palma.",
    monument: "Monumento Histórico",
    open: "Abierto todos los días",
    selectTicket: "Selecciona tu entrada",
    selectDesc: "Elige entre nuestras diferentes opciones de visita",
    completeBooking: "Completa tu reserva",
    selectDate: "Selecciona una fecha",
    selectTime: "Selecciona la hora de entrada",
    selectVisitors: "Selecciona la fecha, hora y número de visitantes",
    adults: "Adultos",
    adultsDesc: "Mayores de 11 años",
    children: "Niños",
    childrenDesc: "0-11 años (30% descuento)",
    total: "Total",
    bookNow: "Reservar ahora",
    cancel: "Cancelación gratuita hasta 24 horas antes de la visita",
    infoCards: [
      { title: "Audioguías disponibles", desc: "Disponibles en 16 idiomas diferentes para una experiencia completa" },
      { title: "Entrada digital", desc: "Presenta tu entrada directamente desde tu móvil" },
      { title: "Acceso prioritario", desc: "Evita las colas con nuestro sistema de reservas online" }
    ],
    footer: {
      addressTitle: "Catedral de Mallorca",
      address: "Plaça de la Seu, s/n\n07001 Palma, España",
      hoursTitle: "Horarios",
      hours: "Lunes - Domingo\n09:00 - 18:00",
      contactTitle: "Contacto",
      contact: "Tel: +34 971 71 31 33\ninfo@catedraldemallorca.org",
      infoTitle: "Información",
      infoList: ["Preguntas frecuentes", "Política de cancelación", "Accesibilidad", "Contacto"],
      copyright: "© 2025 Catedral de Mallorca. Todos los derechos reservados."
    }
  },
  en: {
    title: "Cathedral of Mallorca",
    subtitle: "Cathedral of Mallorca",
    heroTitle: "Discover the Cathedral of Mallorca",
    heroDesc: "Book your ticket to the Gothic masterpiece. A unique experience in the heart of Palma.",
    monument: "Historic Monument",
    open: "Open every day",
    selectTicket: "Select your ticket",
    selectDesc: "Choose from our different visit options",
    completeBooking: "Complete your booking",
    selectDate: "Select a date",
    selectTime: "Select entry time",
    selectVisitors: "Select date, time and number of visitors",
    adults: "Adults",
    adultsDesc: "Over 11 years",
    children: "Children",
    childrenDesc: "0-11 years (30% discount)",
    total: "Total",
    bookNow: "Book now",
    cancel: "Free cancellation up to 24 hours before your visit",
    infoCards: [
      { title: "Audio guides available", desc: "Available in 16 different languages for a complete experience" },
      { title: "Digital ticket", desc: "Show your ticket directly from your mobile" },
      { title: "Priority access", desc: "Skip the lines with our online booking system" }
    ],
    footer: {
      addressTitle: "Cathedral of Mallorca",
      address: "Plaça de la Seu, s/n\n07001 Palma, Spain",
      hoursTitle: "Opening hours",
      hours: "Monday - Sunday\n09:00 - 18:00",
      contactTitle: "Contact",
      contact: "Tel: +34 971 71 31 33\ninfo@catedraldemallorca.org",
      infoTitle: "Information",
      infoList: ["Frequently asked questions", "Cancellation policy", "Accessibility", "Contact"],
      copyright: "© 2025 Cathedral of Mallorca. All rights reserved."
    }
  }
};

const ticketTypes = [
          {
            id: "catedral-museu-art-sacre-audioguia",
            title: "Visita Catedral + Museu d’Art Sacre + Audioguia",
            description: "Inclou: entrada a la Catedral de Mallorca + entrada Museu d'Art Sacre + audioguia.",
            price: 15,
            features: [
              "L’entrada preferent s’haurà d’adquirir a les taquilles de la Catedral i s’haurá d’acreditar per mitjà del carnet d’estudiant, targeta de desocupació en vigor o certificat de discapacitat."
            ],
            popular: false,
          },
        {
          id: "catedral-museu-art-sacre",
          title: "Visita Catedral + Museu d’Art Sacre",
          description: "Inclou entrada a la Catedral i al Museu d'Art Sacre. Audioguia opcional.",
          price: 10,
          features: [
            "Reduccions especials a taquilla amb acreditació.",
            "Accés principal pel Portal del Mirador (abril-octubre)."
          ],
          popular: false,
        },
      {
        id: "catedral-terrazas-museu",
        title: "Catedral de Mallorca + Terrasses + Museu d’Art Sacre",
        description: "Inclou la visita a la Catedral.",
        price: 25,
        features: [
          "Inclou la visita a la Catedral",
          "Prohibida la pujada a les terrasses a persones menors de 9 anys",
          "Els divendres de cada setmana s'ofereix la visita gratuïta per a residents i naturals de la diòcesi de Mallorca (només en taquilla, amb acreditació)"
        ],
        popular: false,
      },
  {
    id: "catedral-terrazas-audioguia",
    title: "Catedral de Mallorca + Terrasses + Audioguia",
    description: "Inclou la visita a la Catedral. Inclou una audioguia disponible en: espanyol, català, anglès, francès, alemany, italià i rus.",
    price: 30,
    features: [
      "Inclou la visita a la Catedral",
      "Audioguia disponible en 7 idiomes",
      "Prohibida la pujada a les terrasses a persones menors de 9 anys"
    ],
    popular: true,
  },
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

export default function Home() {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [adultCount, setAdultCount] = useState<number>(1);
  const [childCount, setChildCount] = useState<number>(0);
  const [language, setLanguage] = useState<Lang>("ca");
  const t: Translation = translations[language];

  const calculateTotal = () => {
    const ticket = ticketTypes.find(t => t.id === selectedTicket);
    if (!ticket) return 0;
    return ticket.price * adultCount + (ticket.price * 0.7) * childCount;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Building className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <div>
                <h1 className="text-lg md:text-2xl font-bold text-primary">{t.title}</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4">
              <Select value={language} onValueChange={(value: string) => setLanguage(value as Lang)}>
                <SelectTrigger className="w-28 md:w-32 h-9 text-sm">
                  <Globe className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ca">Català</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://tck-mallorca-s3.s3.amazonaws.com/uploads/1746698053CatedralInterior.jpg"
            alt="Catedral de Mallorca Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-end pb-12 md:pb-16">
          <div className="text-white max-w-3xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              {t.heroTitle}
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-white/90 mb-4 md:mb-6">
              {t.heroDesc}
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4">
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 md:px-4 py-1.5 md:py-2">
                  <Star className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2 fill-yellow-400 text-yellow-400" /> {t.monument}
                </Badge>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 px-3 md:px-4 py-1.5 md:py-2">
                  <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1.5 md:mr-2" /> {t.open}
                </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Ticket Selection */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">{t.selectTicket}</h3>
          <p className="text-muted-foreground text-lg">
            {t.selectDesc}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {ticketTypes.map((ticket) => (
            <Card
              key={ticket.id}
              className={`relative cursor-pointer transition-all hover:shadow-xl ${
                selectedTicket === ticket.id
                  ? "border-primary border-2 shadow-lg"
                  : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedTicket(ticket.id)}
            >
              {ticket.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">Més Popular</Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{ticket.title}</CardTitle>
                <CardDescription>{ticket.description}</CardDescription>
                <div className="text-3xl font-bold text-primary mt-4">
                  {ticket.price}€
                  <span className="text-sm font-normal text-muted-foreground">/persona</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {ticket.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm">
                      <ChevronRight className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Date, Time, and Visitors Selection */}
        {selectedTicket && (
          <div className="max-w-4xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">{t.completeBooking}</CardTitle>
                <CardDescription>
                  {t.selectVisitors}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="date" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="date">
                      <Calendar className="h-4 w-4 mr-2" />
                      Data
                    </TabsTrigger>
                    <TabsTrigger value="time">
                      <Clock className="h-4 w-4 mr-2" />
                      Hora
                    </TabsTrigger>
                    <TabsTrigger value="visitors">
                      <Users className="h-4 w-4 mr-2" />
                      Visitants
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="date" className="space-y-4 mt-6">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        {t.selectDate}
                      </label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 border rounded-md"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="time" className="space-y-4 mt-6">
                    <div>
                      <label className="text-sm font-medium mb-3 block">
                        {t.selectTime}
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            onClick={() => setSelectedTime(time)}
                            className="w-full"
                            size="sm"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="visitors" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{t.adults}</p>
                          <p className="text-sm text-muted-foreground">{t.adultsDesc}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setAdultCount(Math.max(0, adultCount - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-semibold">{adultCount}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setAdultCount(adultCount + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{t.children}</p>
                          <p className="text-sm text-muted-foreground">{t.childrenDesc}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setChildCount(Math.max(0, childCount - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center font-semibold">{childCount}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setChildCount(childCount + 1)}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Summary and Checkout */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">{t.total}</span>
                    <span className="text-3xl font-bold text-primary">
                      {calculateTotal().toFixed(2)}€
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!selectedDate || !selectedTime || (adultCount + childCount) === 0}
                  >
                    {t.bookNow}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    {t.cancel}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </section>

      {/* Information Section */}
      <section className="bg-gradient-to-br from-orange-100 to-orange-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Headphones className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t.infoCards[0].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.infoCards[0].desc}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Smartphone className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t.infoCards[1].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.infoCards[1].desc}
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <Clock className="h-12 w-12 text-primary mb-4" />
                <CardTitle>{t.infoCards[2].title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.infoCards[2].desc}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold text-lg mb-4">{t.footer.addressTitle}</h4>
              <p className="text-zinc-400 text-sm" style={{whiteSpace: 'pre-line'}}>
                {t.footer.address}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">{t.footer.hoursTitle}</h4>
              <p className="text-zinc-400 text-sm" style={{whiteSpace: 'pre-line'}}>
                {t.footer.hours}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">{t.footer.contactTitle}</h4>
              <p className="text-zinc-400 text-sm" style={{whiteSpace: 'pre-line'}}>
                {t.footer.contact}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">{t.footer.infoTitle}</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                {t.footer.infoList.map((item: string, idx: number) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-zinc-800 mt-8 pt-8 text-center text-zinc-400 text-sm">
            <p>{t.footer.copyright}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
