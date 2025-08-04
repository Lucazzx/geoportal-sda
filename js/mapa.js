// Pega a referência ao elemento de loading que criamos no HTML
const loadingOverlay = document.getElementById('loading-overlay');

// Inicializa o mapa com centro na Bahia e um nível de zoom adequado
const mapa = L.map('mapa').setView([-13.5, -41.5], 7);

// Adiciona base OpenStreetMap com atribuição correta
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mapa);

function getCor(qtd) {
  return qtd > 1000 ? '#00441b' :    // Verde escuro - Muito alto
         qtd > 500  ? '#2a924a' :    // Verde médio escuro - Alto
         qtd > 250  ? '#7bc87c' :    // Verde médio - Médio
         qtd > 50   ? '#ccebc5' :    // Verde claro - Baixo
                      '#f7fcb9';     // Amarelo claro - Muito baixo ou zero
}

// Carrega o arquivo GeoJSON (certifique-se que ele foi exportado como EPSG:4326)
fetch("dados/mun_titulos_sda.geojson")
  .then(response => {
    if (!response.ok) {
      throw new Error("Não foi possível carregar o arquivo GeoJSON. Verifique o caminho e o arquivo.");
    }
    return response.json();
  })
.then(dados => {
    L.geoJSON(dados, {
      style: feature => ({
        // Acessa a propriedade "Títulos". Garanta que o nome está correto.
        fillColor: getCor(feature.properties.Títulos),
        color: "#444", // Cor da borda
        weight: 1,      // Espessura da borda
        fillOpacity: 0.7
      }),
      onEachFeature: (feature, layer) => {
        
        // --- log ---
        console.log("Propriedades recebidas:", feature.properties); 
        // -------------------------

        const props = feature.properties;
        const municipio = props.Municipio_ || props.municipio || props.MUNICIPIO1;
        const titulos = props.Títulos || 0;

        const popupContent = `<strong>${municipio}</strong><br>Títulos emitidos: ${titulos}`;
        layer.bindPopup(popupContent);
      }
    }).addTo(mapa);
})
  .catch(error => {
    console.error("Erro no processamento do GeoJSON:", error);
    // Adiciona um alerta visual no site para o usuário saber do erro
    alert("Ocorreu um erro ao carregar os dados do mapa. Verifique o console para mais detalhes.");
  })

  .finally(() => {
    // Loading.
    loadingOverlay.style.display = 'none';
  })
  
  const legenda = L.control({ position: 'topright' });

  legenda.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legenda');
    const grades = [0, 51, 251, 501, 1001];
    const labels = [
      '0 – 50',
      '51 – 250',
      '251 – 500',
      '501 – 1000',
      '> 1000'
    ];

    div.innerHTML = '<strong>Títulos emitidos</strong><br>';

    for (let i = 0; i < grades.length; i++) {
      const cor = getCor(grades[i] + 1);
      div.innerHTML +=
        `<i style="background:${cor}"></i> ${labels[i]}<br>`;
    }

    return div;
  };

  legenda.addTo(mapa);
