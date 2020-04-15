const codesPostaux = document.getElementById('code');
const nom = document.getElementById('ville');
const insee = document.getElementById('insee');
const erreur = document.getElementById('erreur');
const div = document.getElementById('inputs');
let arrayCitys = [];

// F° lancée lorsque la souris sort de l'input code postal pour remplir automatiquement le nom de la ville et le n° insee
codesPostaux.addEventListener('focusout', (event) => {
  let cpInput = event.target.value;
  erreur.innerHTML = "";
  if (cpInput != "") {
    ajaxGet("https://geo.api.gouv.fr/communes?codePostal=" + cpInput + "&fields=nom,code,codesPostaux&format=json&geometry=centre", function (response) {
      let datas = JSON.parse(response);
      if (datas.length > 0) {
        ville.value = datas[0].nom;
        insee.value = datas[0].code;
      } else {
        erreur.innerHTML = "Erreur dans la saisie du code postal"
      }
    })
  }
});

let callApiForCodes = function (event) {
  //let villeInput = event.target.value;
  // Effacer le select de villes s'il existe avant de lancer un nouvel appel
  if(document.getElementById('choixVille') != null) {
    let element = document.getElementById('choixVille');
    element.parentNode.removeChild(element);
  }
  let villeInput = event.target.textContent;
  erreur.innerHTML = "";
  let text = "";
  if (villeInput != "") {
    ajaxGet("https://geo.api.gouv.fr/communes?nom=" + villeInput + "&fields=nom,code,codesPostaux,departement&format=json&geometry=centre", function (response) {
      let datas = JSON.parse(response);
      // Si 1 résultat
      if (datas.length > 0 && datas.length < 2) {
        codesPostaux.value = datas[0].codesPostaux[0];
        insee.value = datas[0].code;
        // Si plusieurs résultats possibles, proposez de choisir la bonne ville, Affichage d'un choix multiple
      } else if (datas.length > 1) {
        codesPostaux.value = datas[0].codesPostaux[0];
        insee.value = datas[0].code;
        text = "<select id='choixVille'>";
        datas.forEach(function (ville, index) {
          text += "<option value=" + index + ">" + ville.nom + " (" + ville.departement.code + ")</option>";
        })
        text += "</select>";
        div.insertAdjacentHTML("beforeend", text);
        let choixVille = document.getElementById("choixVille");
        // Lorsque ville selectionnée, on remplit automatiquement le champs ville
        choixVille.addEventListener('input', function (e) {
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
};

// F° lancée lorsque la souris sort de l'input ville pour remplir automatiquement le cp et le n° insee
//nom.addEventListener('focusout', callApiForCodes, false);

// Autocomplétion au nom de la ville
nom.addEventListener('keydown', (event) => {
    ajaxGet("https://geo.api.gouv.fr/communes?nom=" + event.target.value, function (response) {
      let datas = JSON.parse(response);
      datas.forEach(data => {
        arrayCitys.push(data.nom);
      })
      autocomplete(document.getElementById("ville"), arrayCitys); 
    })
})

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

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function (e) {
    var a, b, i, val = this.value;
    /*close any already open lists of autocompleted values*/
    closeAllLists();
    if (!val) { return false; }
    currentFocus = -1;
    /*create a DIV element that will contain the items (values):*/
    a = document.createElement("DIV");
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    /*append the DIV element as a child of the autocomplete container:*/
    this.parentNode.appendChild(a);
    /*for each item in the array...*/
    for (i = 0; i < arr.length; i++) {
      /*check if the item starts with the same letters as the text field value:*/
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        /*create a DIV element for each matching element:*/
        b = document.createElement("DIV");
        /*make the matching letters bold:*/
        b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        b.innerHTML += arr[i].substr(val.length);
        /*insert a input field that will hold the current array item's value:*/
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        /*execute a function when someone clicks on the item value (DIV element):*/
        b.addEventListener("click", function (e) {
          /*insert the value for the autocomplete text field:*/
          inp.value = this.getElementsByTagName("input")[0].value;
          callApiForCodes(e);
          /*close the list of autocompleted values,
          (or any other open lists of autocompleted values:*/
          closeAllLists();
        });
        a.appendChild(b);
      }
    }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
      increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) { //up
      /*If the arrow UP key is pressed,
      decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}

