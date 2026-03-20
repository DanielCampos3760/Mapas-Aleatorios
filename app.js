const svg = document.getElementById('catan-board');
const HEX_SIDE = 50;
const OFFSET_X = 300; 
const OFFSET_Y = 275;

const RESOURCES = {
    'bosque': { color: '#228b22', name: 'Madera' },
    'trigo': { color: '#ffd700', name: 'Trigo' },
    'oveja': { color: '#7cfc00', name: 'Lana' },
    'arcilla': { color: '#b22222', name: 'Ladrillo' },
    'piedra': { color: '#808080', name: 'Mineral' },
    'desierto': { color: '#f4a460', name: 'Nada' }
};

const PLAYER_COLORS = ['#3498db', '#e74c3c', '#ffffff', '#e67e22']; 

let gameState = {
    tiles: [],
    occupiedNodes: [],
    players: []
};

function actualizarInputsNombres() {
    const num = document.getElementById('num-players').value;
    const container = document.getElementById('player-names-container');
    container.innerHTML = '';
    for (let i = 0; i < num; i++) {
        container.innerHTML += `
            <div class="player-input">
                <label style="color: ${PLAYER_COLORS[i] === '#ffffff' ? '#bdc3c7' : PLAYER_COLORS[i]}">Jugador ${i+1}:</label>
                <input type="text" id="p-name-${i}" placeholder="Nombre...">
            </div>`;
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getPixelCoords(q, r) {
    return { 
        x: HEX_SIDE * (Math.sqrt(3) * q + Math.sqrt(3)/2 * r) + OFFSET_X, 
        y: HEX_SIDE * (3/2 * r) + OFFSET_Y 
    };
}

function iniciarPartida() {
    const num = document.getElementById('num-players').value;
    gameState.players = [];
    for (let i = 0; i < num; i++) {
        const name = document.getElementById(`p-name-${i}`).value || `J${i+1}`;
        gameState.players.push({ id: i, name: name, color: PLAYER_COLORS[i], resources: [] });
    }
    document.getElementById('game-container').style.display = 'block';
    construirMapa();
    ubicarJugadores();
    generarTablaProduccion();
}

function construirMapa() {
    svg.innerHTML = '';
    // CORRECCIÓN: Definir números DENTRO para que se reinicien siempre
    const altaProb = shuffle([6, 6, 8, 8, 5, 5, 9, 9]);
    const bajaProb = shuffle([2, 12, 3, 3, 11, 11, 4, 4, 10, 10]);
    
    const resPool = shuffle(['bosque','bosque','bosque','bosque','trigo','trigo','trigo','trigo','oveja','oveja','oveja','oveja','arcilla','arcilla','arcilla','piedra','piedra','piedra','desierto']);

    const coords = [];
    for (let q = -2; q <= 2; q++) {
        for (let r = Math.max(-2, -q - 2); r <= Math.min(2, -q + 2); r++) coords.push({q, r});
    }

    gameState.tiles = coords.map((c, i) => {
        const res = resPool[i];
        const isOrilla = (Math.abs(c.q) === 2 || Math.abs(c.r) === 2 || Math.abs(-c.q - c.r) === 2);
        let number = null;

        if (res !== 'desierto') {
            const chance = Math.random();
            if (isOrilla) {
                if (chance < 0.7 && altaProb.length > 0) number = altaProb.pop();
                else number = (bajaProb.length > 0) ? bajaProb.pop() : altaProb.pop();
            } else {
                if (chance < 0.7 && bajaProb.length > 0) number = bajaProb.pop();
                else number = (altaProb.length > 0) ? altaProb.pop() : bajaProb.pop();
            }
        }
        return { ...c, resource: res, number };
    });

    gameState.tiles.forEach(tile => {
        const { x, y } = getPixelCoords(tile.q, tile.r);
        const pts = [];
        for (let i = 0; i < 6; i++) {
            const a = (60 * i - 30) * Math.PI / 180;
            pts.push(`${x + HEX_SIDE * Math.cos(a)},${y + HEX_SIDE * Math.sin(a)}`);
        }
        const hex = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        hex.setAttribute("points", pts.join(" "));
        hex.setAttribute("fill", RESOURCES[tile.resource].color);
        hex.setAttribute("stroke", "rgba(255,255,255,0.2)");
        svg.appendChild(hex);

        if (tile.number) {
            const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
            txt.setAttribute("x", x); txt.setAttribute("y", y + 6);
            txt.setAttribute("text-anchor", "middle"); txt.setAttribute("fill", "white");
            txt.setAttribute("font-weight", "bold"); txt.setAttribute("font-size", "16");
            // Contorno para mejor visibilidad
            txt.style.paintOrder = "stroke"; txt.style.stroke = "black"; txt.style.strokeWidth = "2px";
            txt.textContent = tile.number;
            svg.appendChild(txt);
        }
    });
}

function ubicarJugadores() {
    gameState.occupiedNodes = [];
    gameState.players.forEach(player => {
        for (let p = 0; p < 2; p++) { 
            let placed = false;
            let att = 0;
            while (!placed && att < 500) {
                const tile = gameState.tiles[Math.floor(Math.random() * gameState.tiles.length)];
                const cIdx = Math.floor(Math.random() * 6);
                const a = (60 * cIdx - 30) * Math.PI / 180;
                const { x, y } = getPixelCoords(tile.q, tile.r);
                const px = Math.round(x + HEX_SIDE * Math.cos(a));
                const py = Math.round(y + HEX_SIDE * Math.sin(a));

                const tooClose = gameState.occupiedNodes.some(n => Math.sqrt((px - n.x)**2 + (py - n.y)**2) < (HEX_SIDE * 1.1));
                
                // Probabilidad desierto 42.5%
                if (tooClose || (tile.resource === 'desierto' && Math.random() > 0.425)) { att++; continue; }

                const adj = gameState.tiles.filter(t => {
                    for (let i = 0; i < 6; i++) {
                        const ta = (60 * i - 30) * Math.PI / 180;
                        const tCoord = getPixelCoords(t.q, t.r);
                        if (Math.round(tCoord.x + HEX_SIDE * Math.cos(ta)) === px && Math.round(tCoord.y + HEX_SIDE * Math.sin(ta)) === py) return true;
                    }
                    return false;
                }).filter(t => t.resource !== 'desierto');

                if (adj.length >= 2) {
                    dibujarPiezas(px, py, tile, cIdx, player, p);
                    adj.forEach(t => player.resources.push({ type: t.resource, num: t.number }));
                    gameState.occupiedNodes.push({x: px, y: py});
                    placed = true;
                }
                att++;
            }
        }
    });
}

function dibujarPiezas(px, py, tile, cIdx, player, p) {
    const { x, y } = getPixelCoords(tile.q, tile.r);
    const nC = (cIdx + 1) % 6;
    const nA = (60 * nC - 30) * Math.PI / 180;
    const ex = Math.round(x + HEX_SIDE * Math.cos(nA));
    const ey = Math.round(y + HEX_SIDE * Math.sin(nA));
    
    const road = document.createElementNS("http://www.w3.org/2000/svg", "line");
    road.setAttribute("x1", px); road.setAttribute("y1", py);
    road.setAttribute("x2", ex); road.setAttribute("y2", ey);
    road.setAttribute("stroke", player.color); road.setAttribute("stroke-width", "8");
    road.setAttribute("stroke-linecap", "round");
    svg.appendChild(road);

    const city = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    city.setAttribute("cx", px); city.setAttribute("cy", py); city.setAttribute("r", "10");
    city.setAttribute("fill", player.color); 
    city.setAttribute("stroke", player.color === "#ffffff" ? "#333" : "white");
    city.setAttribute("stroke-width", "2");
    svg.appendChild(city);

    if (p === 0) {
        const lbl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        lbl.setAttribute("x", px); lbl.setAttribute("y", py - 18);
        lbl.setAttribute("text-anchor", "middle"); lbl.setAttribute("fill", "white");
        lbl.setAttribute("font-weight", "bold"); lbl.setAttribute("font-size", "14");
        lbl.style.paintOrder = "stroke"; lbl.style.stroke = "black"; lbl.style.strokeWidth = "3px";
        lbl.textContent = player.name;
        svg.appendChild(lbl);
    }
}

function generarTablaProduccion() {
    const container = document.getElementById('inventory-container');
    let html = `<table class="production-table">
                <thead><tr><th>Jugador</th><th>MAD</th><th>TRI</th><th>LAN</th><th>LAD</th><th>MIN</th><th>NÚMS</th></tr></thead><tbody>`;

    gameState.players.forEach(p => {
        const c = { bosque: 0, trigo: 0, oveja: 0, arcilla: 0, piedra: 0 };
        const n = [];
        p.resources.forEach(r => {
            c[r.type]++;
            if (r.num && !n.includes(r.num)) n.push(r.num);
        });
        html += `<tr>
            <td style="color: ${p.color === '#ffffff' ? '#bdc3c7' : p.color}; font-weight: bold;">${p.name}</td>
            <td>${c.bosque}</td><td>${c.trigo}</td><td>${c.oveja}</td><td>${c.arcilla}</td><td>${c.piedra}</td>
            <td style="font-size: 0.75rem;">${n.sort((a,b)=>a-b).join(', ')}</td>
        </tr>`;
    });
    container.innerHTML = html + `</tbody></table>`;
}

actualizarInputsNombres();