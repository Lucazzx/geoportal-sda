// Inicializa o mapa com centro na Bahia e um nível de zoom adequado
const mapa = L.map('mapa').setView([-12.5, -41.5], 7); // Aumentei o zoom para 7, fica melhor para a Bahia

// Adiciona base OpenStreetMap com atribuição correta
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mapa);

// Função para definir a cor de preenchimento baseada na quantidade de títulos
function getCor(qtd) {
  return qtd > 500 ? '#00441b' :
         qtd > 250 ? '#2a924a' :
         qtd > 100 ? '#7bc87c' :
         qtd > 50  ? '#ccebc5' :
         qtd > 0   ? '#f7fcb9' :
                     '#f0f0f0'; // Cor para municípios sem títulos ou com dados zerados
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
        
        // --- ADICIONE ESTA LINHA ---
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
  });