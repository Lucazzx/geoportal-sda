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
    layers: [mapaSatelite],
    maxZoom: 19
});

// Agrupa as camadas de base para o controle
const baseMaps = {
    "Ruas": mapaRuas,
    "Satélite": mapaSatelite
};

const layerControl = L.control.layers(baseMaps).addTo(mapa);

// --- CONEXÃO COM O GEOSERVER ---
const urlGeoServer = 'http://10.63.25.200:8080/geoserver/geoportalsda/wms';
const camadaWMS = 'geoportalsda:mun_titulos_sda';

const camadaMunicipios = L.tileLayer.wms(urlGeoServer, {
    layers: camadaWMS,
    format: 'image/png',
    transparent: true,
    attribution: 'SDA / Governo da Bahia'
}).addTo(mapa);

layerControl.addOverlay(camadaMunicipios, "Títulos por Município");

// Esconde o loading
loadingOverlay.style.display = 'none';

// --- LÓGICA PARA POPUPS COM "PASSAR O MOUSE" (GetFeatureInfo com Debounce) ---

// Variável para guardar o popup e evitar que vários apareçam
let popup = L.popup();
// Variável para controlar em qual município o mouse está, para evitar flickering
let currentFeatureId = null;

// Função "Debounce": cria um atraso para evitar excesso de requisições
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Função que busca os dados do município no GeoServer
function fetchFeatureInfo(e) {
    const BBOX = mapa.getBounds().toBBoxString();
    const WIDTH = mapa.getSize().x;
    const HEIGHT = mapa.getSize().y;
    const X = Math.round(e.containerPoint.x);
    const Y = Math.round(e.containerPoint.y);
    const URL = `${urlGeoServer}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&LAYERS=${camadaWMS}&QUERY_LAYERS=${camadaWMS}&BBOX=${BBOX}&FEATURE_COUNT=1&HEIGHT=${HEIGHT}&WIDTH=${WIDTH}&INFO_FORMAT=application/json&SRS=EPSG:4326&X=${X}&Y=${Y}`;

    fetch(URL)
      .then(response => response.json())
      .then(data => {
        // Se o GeoServer não encontrou nada, fecha o popup e reseta o controle
        if (!data.features || data.features.length === 0) {
            mapa.closePopup(popup);
            currentFeatureId = null;
            return;
        }

        const feature = data.features[0];
        // Se o mouse ainda estiver sobre o mesmo município, não faz nada
        if (feature.id === currentFeatureId) {
            return;
        }
        
        currentFeatureId = feature.id;
        const props = feature.properties;
        const municipio = props.Municipio_ || props.municipio || props.MUNICIPIO1;
        const titulos = props.títulos || 0;
        const popupContent = `<strong>${municipio}</strong><br>Títulos emitidos: ${titulos}`;
        
        popup.setLatLng(e.latlng)
             .setContent(popupContent)
             .openOn(mapa);
      })
      .catch(error => {
        console.error("Erro ao buscar GetFeatureInfo:", error);
      });
}

// Escuta o evento de mover o mouse no mapa e chama a função de busca com o atraso (debounce)
mapa.on('mousemove', debounce(fetchFeatureInfo, 50)); // 150ms é um bom atraso