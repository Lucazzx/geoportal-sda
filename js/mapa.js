// --- Início do mapa.js ---

// Pega a referência ao elemento de loading
const loadingOverlay = document.getElementById('loading-overlay');

// ===================================================================
// PASSO 1: DEFINIR AS DIFERENTES CAMADAS DE BASE (MAPAS DE FUNDO)
// ===================================================================

// Camada de Ruas (OpenStreetMap) - Geralmente vai até o zoom 19
const mapaRuas = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 19 // Informa que esta camada tem zoom até o nível 19
});

// Camada de Satélite (Esri) - A cobertura global de alta resolução geralmente vai até o 18
const mapaSatelite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; ...',
    maxZoom: 16 // Informa que esta camada tem zoom somente até o nível 18
});

// Inicializa o mapa, definindo um limite de zoom geral
const mapa = L.map('mapa', {
    center: [-13.2, -41.5],
    zoom: 7,
    layers: [mapaSatelite],
    maxZoom: 16 // Define que o mapa como um todo não pode passar do zoom 19
});


// ===================================================================
// PASSO 3: CRIAR OS GRUPOS DE CAMADAS PARA O CONTROLE
// ===================================================================

// Agrupa as camadas de base. O texto entre aspas é o que aparecerá para o usuário.
const baseMaps = {
    "Ruas": mapaRuas,
    "Satélite": mapaSatelite
};

// Adiciona o controle de camadas ao mapa, passando apenas os mapas de base por enquanto
const layerControl = L.control.layers(baseMaps).addTo(mapa);


// ===================================================================
// LÓGICA DE DADOS (CARREGAMENTO DO GEOJSON E POPUPS)
// ===================================================================

function getCor(qtd) {
  return qtd > 1000 ? '#00441b' :
         qtd > 500  ? '#2a924a' :
         qtd > 250  ? '#7bc87c' :
         qtd > 50   ? '#ccebc5' :
                      '#f7fcb9';
}

fetch("dados/mun_titulos_sda.geojson")
  .then(response => {
    if (!response.ok) {
      throw new Error("Não foi possível carregar o arquivo GeoJSON.");
    }
    return response.json();
  })
  .then(dados => {
    // Cria a camada de municípios
    const camadaMunicipios = L.geoJSON(dados, {
      style: feature => ({
        fillColor: getCor(feature.properties.Títulos),
        color: "#444",
        weight: 1,
        fillOpacity: 0.7
      }),
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        const municipio = props.Municipio_ || props.municipio || props.MUNICIPIO1;
        const titulos = props.Títulos || 0;
        const popupContent = `<strong>${municipio}</strong><br>Títulos emitidos: ${titulos}`;
        
        layer.bindPopup(popupContent);
        layer.on('mouseover', function (e) { this.openPopup(); });
        layer.on('mouseout', function (e) { this.closePopup(); });
      }
    });

    // Adiciona a camada de municípios ao mapa
    camadaMunicipios.addTo(mapa);

    // ===================================================================
    // PASSO 4: ADICIONAR A CAMADA DE MUNICÍPIOS AO CONTROLE
    // ===================================================================
    // Agora que a camada foi criada, nós a adicionamos ao controle já existente.
    layerControl.addOverlay(camadaMunicipios, "Títulos por Município");

  })
  .catch(error => {
    console.error("Erro no processamento do GeoJSON:", error);
    alert("Ocorreu um erro ao carregar os dados do mapa.");
  })
  .finally(() => {
    // Esconde o ícone de loading
    loadingOverlay.style.display = 'none';
  });


// Legenda (seu código de legenda continua igual)
const legenda = L.control({ position: 'topright' });

legenda.onAdd = function (map) {
  const div = L.DomUtil.create('div', 'info legenda');
  const grades = [0, 51, 251, 501, 1001];
  const labels = ['0 – 50', '51 – 250', '251 – 500', '501 – 1000', '> 1000'];
  div.innerHTML = '<strong>Títulos emitidos</strong><br>';
  for (let i = 0; i < grades.length; i++) {
    div.innerHTML += `<i style="background:${getCor(grades[i] + 1)}"></i> ${labels[i]}<br>`;
  }
  return div;
};
legenda.addTo(mapa);

// --- Fim do mapa.js ---