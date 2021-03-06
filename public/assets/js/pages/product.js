const basket = getBasket();
let product_id;
let color_url;

document.addEventListener("DOMContentLoaded", () => {
    defineUrlParam();
    getProduct(product_id).then(product => {
        product_api = product;
        insertProduct(product);
        initNbProduct(document.querySelector('[name=colors]'));
    }).catch((error) => insertDivError(error));
    loadPage('div-product__description');

    document.getElementById('add-basket').addEventListener('click', () => clickAddUpdateProduct(document.getElementById('div-product')));
    document.querySelector('[name=colors]').addEventListener('change', function() {initNbProduct(this)});

    const nb_product = document.getElementById('nb_product');
    nb_product.addEventListener('change', () => updatePrice());
    nb_product.addEventListener('input', function() { if( !this.reportValidity()) this.value = 1 });
});

/**
 *  Define globals variables with url parameters
 */
function defineUrlParam() {
    const url = new URL(location.href)
    const params = new URLSearchParams(url.search);

    product_id = params.get('id');
    color_url = params.get('color');
}

/**
 * Hydrate product div
 * @param product
 */
function insertProduct(product) {
    document.querySelector('[data-product_name]').textContent = product.name;
    document.querySelector('[data-product_image]').setAttribute('src', product.imageUrl);
    document.querySelector('[data-product_description]').textContent = product.description;
    document.querySelector('[data-product_colors]').innerHTML = generateColorOptions(product.colors);
    document.querySelector('[data-product_price]').textContent = formatPrice(product.price);

    if(color_url !== null) { initNbProduct(color_url); }
}

/**
 * Generate options for colors select
 * @param options
 * @returns {*}
 */
function generateColorOptions(options) {
    return options.map((option) => '<option value="' + option + '" ' + (option === color_url ? 'selected="selected"' : '') +'>' + option + '</option>').join();
}

/**
 * Hydrate product div with basket datas
 * @param input_color
 */
function initNbProduct(input_color) {
    const infos = productGetInfos(product_id, input_color.value);
    const nb_product = infos !== undefined ? infos.nb : 1

    document.querySelector('[name=product_numb]').value = nb_product;
    document.querySelector('[data-product_price]').textContent = formatPrice(product_api.price * nb_product);
    updateBtnAdd(infos !== undefined ? 'update' : 'add');
}

/**
 * Add / Update numb product in basket when click on numb input
 */
function clickAddUpdateProduct() {
    const nb_product = parseInt(document.getElementById('nb_product').value);
    if(nb_product < 1) return;

    const infos = {
        name: document.getElementById('colors').value,
        nb: nb_product,
    }

    const nb_total_product = basketAddOrUpdateProduct(product_api, infos);

    animate_logo_basket(nb_total_product);
    updateBtnAdd('update');
}

/**
 * Update total price
 */
function updatePrice() {
    const nb_product = document.getElementById('nb_product').value;
    document.querySelector('[data-product_price]').textContent = formatPrice(product_api.price * nb_product);
}

/**
 * Update button "add / update" titled
 * @param etat
 */
function updateBtnAdd(etat) {
    document.getElementById('add-basket').textContent = etat === 'update' ? 'Modifier le panier' : 'Ajouter au panier';
}