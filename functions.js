const codesPostaux = document.getElementById('code');
const nom = document.getElementById('ville');
const insee = document.getElementById('insee');
const erreur = document.getElementById('erreur');
const div = document.getElementById('inputs');

// F° lancée après remplissage de l'input code postal pour remplir automatiquement le nom de la ville et le n° insee
codesPostaux.addEventListener('focusout', (event) => {
  let cpInput = event.target.value;
  erreur.innerHTML = "";
  if(cpInput != ""){ 
    ajaxGet("https://geo.api.gouv.fr/communes?codePostal="+cpInput+"&fields=nom,code,codesPostaux&format=json&geometry=centre", function(response) {
        let datas = JSON.parse(response);
        if(datas.length > 0) {
          ville.value = datas[0].nom;
          insee.value = datas[0].code;
        } else {
          erreur.innerHTML = "Erreur dans la saisie du code postal"
        }    
    })
  } 
});

// F° lancée après remplissage de l'input ville pour remplir automatiquement le cp et le n° insee
nom.addEventListener('focusout', (event) => {
  let villeInput = event.target.value;
  erreur.innerHTML = "";
  let text = "";
  if(villeInput != ""){ 
    ajaxGet("https://geo.api.gouv.fr/communes?nom="+villeInput+"&fields=nom,code,codesPostaux,departement&format=json&geometry=centre", function(response) {
        let datas = JSON.parse(response);
        console.log(datas);
        // Si 1 résultat
        if(datas.length > 0 && datas.length < 2) {
          code.value = datas[0].codesPostaux[0];
          insee.value = datas[0].code;
        // Si plusieurs résultats possibles, proposez de choisir la bonne ville, Affichage d'un choix multiple
        } else if(datas.length > 1){
          text = "<select id='choixVille'>";
          datas.forEach(function(ville, index) {
            text += "<option value="+index+">"+ville.nom+" ("+ville.departement.code+")</option>";
          })   
          text += "</select>";
          div.insertAdjacentHTML("beforeend", text);
          let choixVille = document.getElementById("choixVille");
          // Lorsque ville selectionnée, on remplit automatiquement le champs ville
          choixVille.addEventListener('input', function(e) {
            let idVille = e.target.value;
            nom.value = datas[idVille].nom;
            code.value = datas[idVille].codesPostaux[0];
            insee.value = datas[idVille].code;
          });
        } else {
          erreur.innerHTML = "Erreur dans la saisie du nom de la ville"
        }
    })
  } 
});

// Exécute un appel AJAX GET
// Prend en paramètres l'URL cible et la fonction callback appelée en cas de succès
function ajaxGet(url, callback) {
  var req = new XMLHttpRequest();
  req.open("GET", url);
  req.addEventListener("load", function () {
      if (req.status >= 200 && req.status < 400) {
          // Appelle la fonction callback en lui passant la réponse de la requête
          callback(req.responseText);
      } else {
          console.error(req.status + " " + req.statusText + " " + url);
      }
  });
  req.addEventListener("error", function () {
      console.error("Erreur réseau avec l'URL " + url);
  });
  req.send(null);
}