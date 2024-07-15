document.addEventListener('DOMContentLoaded', function() {
    const ideeContainer = document.querySelector('#idee-container');
    const ideeURL = 'http://localhost:3000/idees';
    let allIdees = [];

    // Fonction pour afficher les idées
    const displayIdees = (idees) => {
        // Vider le conteneur d'idées avant d'ajouter les nouvelles idées
        ideeContainer.innerHTML = '';

        // Parcourir chaque idée et générer le HTML correspondant
        idees.forEach(function(idee) {
            let actionButtons = '';
            
            // Ajouter les boutons d'action si l'idée n'est ni approuvée ni désapprouvée
            if (idee.etat !== 'Approuvée' && idee.etat !== 'Désapprouvée') {
                actionButtons = `
                    <i data-id="${idee.id}" class="bi bi-heart-fill text-success" style="font-size: 1.5rem;" data-action="approve" title="Approuver"></i>
                    <i data-id="${idee.id}" class="bi bi-hand-thumbs-down-fill text-warning" style="font-size: 1.5rem;" data-action="reject" title="Désapprouver"></i>
                `;
            }
            
            // Générer le HTML de l'idée
            const ideeHtml = `
                <div class="col-md-4 mb-3">
                    <div id="idee-${idee.id}" class="card">
                        <div class="card-body">
                            <h5 class="card-title">${idee.libelle}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">Auteur: ${idee.auteur}</h6>
                            <p class="card-text">${idee.message}</p>
                            <p class="card-text"><small class="text-muted">État: ${idee.etat}</small></p>
                            <p class="card-text"><small class="text-muted">Catégorie: ${idee.categorie}</small></p>
                            <div class="d-flex justify-content-between">
                                ${actionButtons}
                                <i data-id="${idee.id}" class="bi bi-trash3 text-danger" style="font-size: 1.5rem;" data-action="delete" title="Supprimer"></i>
                            </div>
                        </div>
                    </div>
                </div>`;

            // Ajouter le HTML de l'idée au conteneur
            ideeContainer.innerHTML += ideeHtml;
        });
    };

    // Fonction pour sauvegarder les idées dans le Local Storage
    const saveIdeesToLocalStorage = (idees) => {
        localStorage.setItem('idees', JSON.stringify(idees));
    };

    // Fonction pour charger les idées depuis le Local Storage
    const loadIdeesFromLocalStorage = () => {
        const idees = localStorage.getItem('idees');
        return idees ? JSON.parse(idees) : [];
    };

    // Récupérer les idées depuis le serveur et les afficher, puis les sauvegarder dans le Local Storage
    // La fonction fetch envoie une requête HTTP au serveur à l'URL spécifiée (ideeURL) et retourne une promesse
    //.then() dans ce projet est nécessaire et appropriée pour gérer les opérations asynchrones liées à la récupération et au traitement des données depuis un serveur.
    fetch(ideeURL)
        .then(response => response.json())
        .then(ideeData => {
            allIdees = ideeData;
            displayIdees(allIdees);
            saveIdeesToLocalStorage(allIdees);
        })
        .catch(() => {
            // En cas d'erreur de récupération, charger les idées depuis le Local Storage
            allIdees = loadIdeesFromLocalStorage();
            displayIdees(allIdees);
        });

    const ideeForm = document.querySelector('#idee-form');
    // Gérer la soumission du formulaire
    ideeForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Récupérer les valeurs des champs du formulaire
        const libelleInput = ideeForm.querySelector('#libelle').value;
        const auteurInput = ideeForm.querySelector('#auteur').value;
        const messageInput = ideeForm.querySelector('#message').value;
        const categorieInput = ideeForm.querySelector('#categorie').value;

        // Envoyer les données du formulaire au serveur
        fetch(ideeURL, {
            method: 'POST',
            body: JSON.stringify({
                libelle: libelleInput,
                auteur: auteurInput,
                message: messageInput,
                categorie: categorieInput,
                etat: 'En attente'
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
            .then(idee => {
                // Ajouter la nouvelle idée à la liste, l'afficher et la sauvegarder dans le Local Storage
                allIdees.push(idee);
                displayIdees(allIdees);
                saveIdeesToLocalStorage(allIdees);
                ideeForm.reset(); // Réinitialiser le formulaire
                document.getElementById('submitBtn').disabled = true; // Désactiver le bouton de soumission
            });
    });

    // Fonction pour mettre à jour l'état d'une idée
    const updateIdeeState = (id, newState) => {
        fetch(`${ideeURL}/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ etat: newState }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json())
            .then(updatedIdee => {
                // Mettre à jour l'idée dans la liste, l'afficher et la sauvegarder dans le Local Storage
                const ideeIndex = allIdees.findIndex(idee => idee.id == updatedIdee.id);
                allIdees[ideeIndex] = updatedIdee;
                displayIdees(allIdees);
                saveIdeesToLocalStorage(allIdees);
            });
    };

    // Fonction pour supprimer une idée
    const deleteIdee = (id) => {
        fetch(`${ideeURL}/${id}`, {
            method: 'DELETE'
        }).then(() => {
            // Filtrer l'idée supprimée, afficher les idées restantes et les sauvegarder dans le Local Storage
            allIdees = allIdees.filter(idee => idee.id != id);
            displayIdees(allIdees);
            saveIdeesToLocalStorage(allIdees);
        });
    };

    // Gérer les clics sur les boutons d'action
    ideeContainer.addEventListener('click', (e) => {
        const ideeId = e.target.dataset.id;

        if (e.target.dataset.action === 'approve') {
            updateIdeeState(ideeId, 'Approuvée'); // Approuver l'idée
        } else if (e.target.dataset.action === 'reject') {
            updateIdeeState(ideeId, 'Désapprouvée'); // Désapprouver l'idée
        } else if (e.target.dataset.action === 'delete') {
            deleteIdee(ideeId); // Supprimer l'idée
        }
    });

    // Fonction pour valider un champ de formulaire
    function validateField(input, errorElement, minLength, pattern) {
        let isValid = true;
        errorElement.innerHTML = "";

        // Vérifier si le champ est vide, si la longueur est inférieure à minLength ou si le pattern ne correspond pas
        if (input.value.trim() === "" || (minLength && input.value.length < minLength) || (pattern && !pattern.test(input.value))) {
            errorElement.innerHTML = "Ce champ est requis et doit respecter les contraintes.";
            isValid = false;
        }

        return isValid;
    }

    // Fonction pour valider le formulaire
    function validateForm() {
        let isValid = true;

        // Valider chaque champ du formulaire
        isValid = validateField(document.getElementById('libelle'), document.getElementById('errorLibelle'), 3) && isValid;
        isValid = validateField(document.getElementById('auteur'), document.getElementById('errorAuteur'), 3) && isValid;
        isValid = validateField(document.getElementById('message'), document.getElementById('errorMessage'), 10) && isValid;
        isValid = validateField(document.getElementById('categorie'), document.getElementById('errorCategorie')) && isValid;

        // Activer ou désactiver le bouton de soumission en fonction de la validité du formulaire
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = !isValid;
    }

    // Ajouter un écouteur d'événement pour la validation des champs du formulaire
    const formInputs = document.querySelectorAll('#idee-form input, #idee-form textarea, #idee-form select');
    formInputs.forEach(input => input.addEventListener('input', validateForm));

    // Limiter la longueur du champ message à 255 caractères
    const messageInput = document.getElementById('message');
    messageInput.addEventListener('input', function() {
        if (messageInput.value.length > 255) {
            messageInput.value = messageInput.value.slice(0, 255);
        }
    });
});
