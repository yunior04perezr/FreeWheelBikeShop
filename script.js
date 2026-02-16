import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// 1. CONFIGURACIÓN FIREBASE (REEMPLAZA ESTO)
const firebaseConfig = {
  apiKey: "AIzaSyCm7W1YMW2PH1qfTD3J6PxXuRoZMw9M81k",
  authDomain: "freewheelbikeshop-6f926.firebaseapp.com",
  projectId: "freewheelbikeshop-6f926",
  storageBucket: "freewheelbikeshop-6f926.firebasestorage.app",
  messagingSenderId: "709568222934",
  appId: "1:709568222934:web:8fe5c1e00a37fea65c9b77"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const productosRef = collection(db, "productos");

// 2. VARIABLES GLOBALES
let listaProductosLocal = [];
let carrito = [];
const MI_PASSWORD = "Mateo"; // CAMBIA ESTO POR TU CONTRASEÑA

// 3. LEER DATOS EN TIEMPO REAL
onSnapshot(productosRef, (snapshot) => {
    listaProductosLocal = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    renderizarTienda(listaProductosLocal);
    renderizarAdmin(listaProductosLocal);
});

// 4. FUNCIONES DE RENDERIZADO
window.renderizarTienda = (productos) => {
    const contenedor = document.getElementById('lista-productos');
    contenedor.innerHTML = productos.map(p => `
        <div class="card ${p.agotado ? 'agotado' : ''}">
            <img src="${p.foto}" alt="${p.nombre}">
            <h3>${p.nombre}</h3>
            <p class="precio">$${p.precio}</p>
            ${p.agotado ? '<span class="tag-agotado">PRODUCTO AGOTADO</span>' : 
            `<button onclick="agregarAlCarrito('${p.nombre}', ${p.precio})">🛒 Comprar</button>`}
        </div>
    `).join('');
};

window.renderizarAdmin = (productos) => {
    const contenedor = document.getElementById('gestion-stock');
    contenedor.innerHTML = productos.map(p => `
        <div style="border-bottom: 1px solid #ccc; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
            <span>${p.nombre}</span>
            <div>
                <button onclick="toggleAgotado('${p.id}', ${p.agotado})" style="background: #f1c40f">${p.agotado ? 'Reactivar' : 'Agotar'}</button>
                <button onclick="eliminarProducto('${p.id}')" style="background: #e74c3c">Eliminar</button>
            </div>
        </div>
    `).join('');
};

// 5. BUSCADOR
window.filtrarProductos = () => {
    const texto = document.getElementById('buscador').value.toLowerCase();
    const filtrados = listaProductosLocal.filter(p => p.nombre.toLowerCase().includes(texto));
    renderizarTienda(filtrados);
};

// 6. ACCIONES ADMIN
window.solicitarAcceso = () => {
    if (prompt("Contraseña de Admin:") === MI_PASSWORD) {
        document.getElementById('admin-panel').classList.remove('hidden');
        document.getElementById('login-admin').classList.add('hidden');
    } else { alert("Error"); }
};

window.cerrarSesion = () => {
    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('login-admin').classList.remove('hidden');
};

window.crearProducto = async () => {
    const nombre = document.getElementById('admin-nombre').value;
    const precio = document.getElementById('admin-precio').value;
    const foto = document.getElementById('admin-foto').value;
    if(nombre && precio) {
        await addDoc(productosRef, { nombre, precio: parseFloat(precio), foto: foto || "https://via.placeholder.com/200", agotado: false });
        alert("Producto agregado");
    }
};

window.toggleAgotado = async (id, estado) => {
    await updateDoc(doc(db, "productos", id), { agotado: !estado });
};

window.eliminarProducto = async (id) => {
    if(confirm("¿Borrar producto?")) await deleteDoc(doc(db, "productos", id));
};

// 7. CARRITO
window.agregarAlCarrito = (nombre, precio) => {
    carrito.push({ nombre, precio });
    const total = carrito.reduce((s, p) => s + p.precio, 0);
    document.getElementById('btn-comprar').innerText = `🛒 Enviar Pedido ($${total})`;
};

window.enviarWhatsApp = () => {
    if(carrito.length === 0) return alert("Carrito vacío");
    let msg = "🚲 *FREEWHEEL BIKE SHOP - PEDIDO*\n\n";
    carrito.forEach(p => msg += `- ${p.nombre} ($${p.precio})\n`);
    msg += `\n*TOTAL: $${carrito.reduce((s,p)=>s+p.precio,0)}*`;
    window.open(`https://wa.me/52001228?text=${encodeURIComponent(msg)}`);
};
