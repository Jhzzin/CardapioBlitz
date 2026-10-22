const WHATSAPP = "5588999999999";

const categorias = [
    { id: "carnes",       nome: "Carnes" },
    { id: "hamburgueres", nome: "Hambúrgueres" },
    { id: "bebidas",      nome: "Bebidas" }
];

const produtos = [
    { id: 1, nome: "Picanha na Brasa", desc: "Corte nobre grelhado no ponto, com farofa e vinagrete.", preco: 79.90, categoria: "carnes", popular: true, destaque: true, img: "assets/img/banners/picanha.webp" },
    { id: 2, nome: "Costela Assada", desc: "Assada lentamente por 8 horas, desmancha no garfo.", preco: 69.90, categoria: "carnes", popular: true, img: "assets/img/pratos/costela.webp"},
    { id: 3, nome: "Fraldinha", desc: "Macia e suculenta, acompanha arroz e mandioca.", preco: 64.90, categoria: "carnes", emoji: "🥩", img: "assets/img/pratos/fraldinha.webp"},
    { id: 4, nome: "Linguiça Artesanal", desc: "Linguiça de pernil com pimenta e ervas.", preco: 39.90, categoria: "carnes", emoji: "🌭", img: "assets/img/pratos/linguica.webp" },

    { id: 5, nome: "Espettus Burger", desc: "Blend 180g, queijo, bacon crocante e molho da casa.", preco: 34.90, categoria: "hamburgueres", popular: true, img: "assets/img/pratos/hamburguer.jpg"},
    { id: 6, nome: "Cheddar Bacon", desc: "Blend 180g, cheddar cremoso e bacon.", preco: 32.90, categoria: "hamburgueres", emoji: "🍔", img: "assets/img/pratos/cheddar.webp" },
    { id: 7, nome: "Burger Duplo", desc: "Dois blends de 150g, duplo queijo e cebola caramelizada.", preco: 42.90, categoria: "hamburgueres", emoji: "🍔", img: "assets/img/pratos/cheddarD.jpg"},

    { id: 8, nome: "Refrigerante Lata", desc: "Coca-Cola, Guaraná ou Fanta. 350ml.", preco: 6.00, categoria: "bebidas", emoji: "🥤", img: "assets/img/pratos/coca.jpg" },
    { id: 9, nome: "Suco Natural", desc: "Laranja, limão ou maracujá. 400ml.", preco: 9.00, categoria: "bebidas", emoji: "🍹", img: "assets/img/pratos/suco.jpg" },
    { id: 10, nome: "Cerveja Long Neck", desc: "Gelada, 330ml.", preco: 10.00, categoria: "bebidas", popular: true, img: "assets/img/pratos/cerveja.jpeg" }
];