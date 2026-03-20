# 🎲 Catan Strategic Map Generator

¡Bienvenido al generador de tableros estratégicos para Catan! Este proyecto nace como una herramienta para dinamizar las partidas, ofreciendo configuraciones aleatorias que respetan las reglas lógicas del juego original pero con un giro de probabilidad avanzada.

## 🚀 Características Principales

* **Configuración Flexible**: Soporte para **3 o 4 jugadores** con nombres personalizados.
* **Algoritmo de Posicionamiento Real**: Implementación estricta de la **Regla de la Distancia** (mínimo una arista de separación entre pueblos).
* **Distribución Probabilística de Números**: 
    * 70% de probabilidad de que los números más frecuentes (6, 8, 5, 9) aparezcan en la **orilla**.
    * 70% de probabilidad de que los números menos frecuentes (2, 12, 3, 11) aparezcan en el **centro**.
* **Sesgo del Desierto**: Los vértices que tocan el desierto tienen un **42.5%** de probabilidad de ser elegidos, fomentando retos estratégicos.
* **Garantía de Recursos**: Cada jugador inicia siempre con acceso a por lo menos **dos materiales** distintos.

## 🛠️ Stack Tecnológico

* **HTML5 / SVG**: Para el renderizado preciso de la rejilla hexagonal.
* **CSS3**: Diseño *mobile-first* con variables y Flexbox.
* **JavaScript (Vanilla)**: Motor lógico de generación, validación de colisiones y cálculo de inventario.

## 📋 Tabla de Producción
El sistema genera automáticamente una tabla al inicio de la partida que muestra:
1.  Materiales por jugador (Madera, Trigo, Lana, Ladrillo, Mineral).
2.  Números clave que activan la producción de cada jugador.

## 🔧 Instalación y Uso

1. Clona el repositorio:
   ```bash
   git clone [https://github.com/tu-usuario/catan-generator.git](https://github.com/tu-usuario/catan-generator.git)
