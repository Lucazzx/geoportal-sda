// Pega a referência ao elemento de loading
const loadingOverlay = document.getElementById('loading-overlay');

// Define as camadas de base
const mapaRuas = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19
});

const mapaSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 18
});

// Inicializa o mapa
const mapa = L.map('mapa', {
    center: [-12.9, -41.7],
    zoom: 7,
    layers: [mapaSatelite], // Inicia com satélite por padrão
    maxZoom: 19
});

// Agrupa as camadas de base para o controle
const baseMaps = {
    "Ruas": mapaRuas,
    "Satélite": mapaSatelite
};

const layerControl = L.control.layers(baseMaps).addTo(mapa);

// --- CONEXÃO COM O GEOSERVER ---
// URL do seu GeoServer (usando o IP da sua máquina Windows)
const urlGeoServer = 'http://10.63.25.200:8080/geoserver/sda/wms';

// Adiciona a camada de municípios como uma camada WMS
const camadaMunicipios = L.tileLayer.wms(urlGeoServer, {
    layers: 'sda:municipios_titulos', // Nome no formato "workspace:nomedacamada"
    format: 'image/png',
    transparent: true,
    attribution: 'SDA / Governo da Bahia'
}).addTo(mapa);

// Adiciona a camada ao controle para poder ligar/desligar
layerControl.addOverlay(camadaMunicipios, "Títulos por Município");

// Esconde o loading
loadingOverlay.style.display = 'none';