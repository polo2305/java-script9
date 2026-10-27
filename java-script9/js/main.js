// ==========================================
// PRE-ENTREGA 9: ASINCRONISMO Y PROMESAS
// ==========================================

// 1) Array base de productos iniciales
const productosBase = [
    { id: 1, nombre: "Teclado mecánico", precio: 45000 },
    { id: 2, nombre: "Mouse inalámbrico", precio: 22000 },
    { id: 3, nombre: "Monitor 24''", precio: 180000 }
];

let productos = JSON.parse(localStorage.getItem("productos")) || [];

// Selección de elementos del DOM
const contenedorItems = document.getElementById("contenedor-items");
const formProducto = document.getElementById("form-producto");
const nombreInput = document.getElementById("nombre-input");
const precioInput = document.getElementById("precio-input");
const buscadorInput = document.getElementById("buscador-input");
const feedbackMensaje = document.getElementById("feedback-mensaje");
const infoTemporizador = document.getElementById("info-temporizador");
const estadoCarga = document.getElementById("estado-carga");

// Función para guardar en localStorage
const guardarEnStorage = (arrProductos) => {
    localStorage.setItem("productos", JSON.stringify(arrProductos));
};

// Función de feedback visual
function mostrarFeedback(mensaje, tipo = "exito") {
    feedbackMensaje.textContent = mensaje;
    feedbackMensaje.className = tipo; 
    
    setTimeout(() => {
        feedbackMensaje.className = "oculto";
    }, 3000);
}

// 2) TEMPORIZADOR: setTimeout para mostrar información valiosa segundos después de ingresar
setTimeout(() => {
    infoTemporizador.textContent = "🔔 Recordatorio: ¡Aprovechá 10% OFF pagando en efectivo en caja!";
    infoTemporizador.classList.remove("oculto");
}, 2500);

// 3) PROMESA CON ASYNC/AWAIT Y MANEJO DE ERRORES (try/catch/finally)
// Función que simula una petición asíncrona de carga de datos mediante una Promise
const obtenerProductosAsincronos = () => {
    return new Promise((resolve, reject) => {
        estadoCarga.textContent = "⏳ Cargando productos desde el servidor...";
        
        setTimeout(() => {
            // Simulamos éxito si los datos existen
            const exito = true; 
            if (exito) {
                // Si el storage está vacío, cargamos la base por defecto
                if (productos.length === 0) {
                    productos = productosBase;
                    guardarEnStorage(productos);
                }
                resolve(productos);
            } else {
                reject("No se pudo procesar la operación de carga, intentá de nuevo.");
            }
        }, 2000);
    });
};

// Función principal asíncrona para inicializar la aplicación con try-catch-finally
async function inicializarApp() {
    try {
        // Consumiendo la promesa con await
        const datosCargados = await obtenerProductosAsincronos();
        
        estadoCarga.textContent = `✔️ ${datosCargados.length} productos cargados correctamente.`;
        estadoCarga.className = "banner-info";
        
        renderizarProductos(datosCargados);
    } catch (error) {
        // Manejo de errores en caso de fallo
        estadoCarga.textContent = `⚠️ ${error}`;
        estadoCarga.className = "alerta";
    } finally {
        // El bloque finally se ejecuta siempre (independientemente de si hubo éxito o error)
        console.log("🔄 Proceso de sincronización asíncrona finalizado.");
    }
}

// 4) Renderizado dinámico con Destructuring y Operadores Ternarios
function renderizarProductos(arrayA_Mostrar) {
    contenedorItems.innerHTML = "";

    arrayA_Mostrar.length === 0 
        ? contenedorItems.innerHTML = `<p style="text-align:center; color: #7f8c8d;">No hay productos para mostrar.</p>`
        : arrayA_Mostrar.forEach((producto) => {
            const { id, nombre, precio } = producto;

            const tarjeta = document.createElement("div");
            tarjeta.className = "producto-card";

            tarjeta.innerHTML = `
                <div class="producto-info">
                    <h3>${nombre}</h3>
                    <p>$${precio.toLocaleString('es-AR')}</p>
                </div>
                <button class="btn-eliminar" data-id="${id}">Eliminar</button>
            `;

            contenedorItems.appendChild(tarjeta);
        });

    activarBotonesEliminar();
}

// Gestión de eventos de eliminación y sincronización con storage
function activarBotonesEliminar() {
    const botonesEliminar = document.querySelectorAll(".btn-eliminar");

    botonesEliminar.forEach(boton => {
        boton.addEventListener("click", (e) => {
            const idObtenido = parseInt(e.target.getAttribute("data-id"));
            
            productos = productos.filter(prod => prod.id !== idObtenido);

            guardarEnStorage(productos);
            renderizarProductos(productos);
            mostrarFeedback("🗑️ Producto eliminado y actualizado.", "alerta");
        });
    });
}

// Gestión del formulario para agregar un nuevo producto
formProducto.addEventListener("submit", (e) => {
    e.preventDefault(); 

    const nombreTexto = nombreInput.value.trim();
    const precioValor = parseFloat(precioInput.value);

    if (nombreTexto === "" || isNaN(precioValor) || precioValor <= 0) {
        mostrarFeedback("⚠️ Por favor, completa los campos correctamente.", "alerta");
        return;
    }

    const nuevoProducto = {
        id: productos.length > 0 ? productos[productos.length - 1].id + 1 : 1,
        nombre: nombreTexto,
        precio: precioValor
    };

    productos.push(nuevoProducto);
    guardarEnStorage(productos);
    renderizarProductos(productos);
    mostrarFeedback(`✅ ¡"${nuevoProducto.nombre}" guardado con éxito!`, "exito");

    formProducto.reset();
});

// Evento de teclado para búsqueda en tiempo real
buscadorInput.addEventListener("keyup", (e) => {
    const textoBusqueda = e.target.value.toLowerCase().trim();

    const resultadosFiltrados = productos.filter(prod => 
        prod.nombre.toLowerCase().includes(textoBusqueda)
    );

    renderizarProductos(resultadosFiltrados);
});

// Arrancamos la aplicación ejecutando la función asíncrona
inicializarApp();