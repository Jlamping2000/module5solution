$(function () {
  $("#navbarToggle").blur(function (event) {
    var screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      $("#collapsable-nav").collapse('hide');
    }
  });
});

(function (global) {

var dc = {};

// ---------------------- URLS AND SNIPPETS ----------------------
var homeHtmlUrl = "snippets/home-snippet.html";
var allCategoriesUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
var categoriesTitleHtml = "snippets/categories-title-snippet.html";
var categoryHtml = "snippets/category-snippet.html";
var menuItemsUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
var menuItemsTitleHtml = "snippets/menu-items-title.html";
var menuItemHtml = "snippets/menu-item.html";

// ---------------------- AJAX UTILS ----------------------
var $ajaxUtils = {
  sendGetRequest: function(requestUrl, responseHandler, isJsonResponse) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        if (request.status === 200) {
          var response = isJsonResponse ? JSON.parse(request.responseText) : request.responseText;
          responseHandler(response);
        } else {
          console.error("Error: " + request.status + " loading " + requestUrl);
        }
      }
    };
    request.open("GET", requestUrl, true);
    request.send(null);
  }
};

// ---------------------- HELPER FUNCTIONS ----------------------
var insertHtml = function (selector, html) {
  document.querySelector(selector).innerHTML = html;
};

var showLoading = function (selector) {
  insertHtml(selector, "<div class='text-center'><img src='images/ajax-loader.gif'></div>");
};

var insertProperty = function (string, propName, propValue) {
  return string.replace(new RegExp("{{" + propName + "}}", "g"), propValue);
};

var switchMenuToActive = function () {
  var classes = document.querySelector("#navHomeButton").className;
  document.querySelector("#navHomeButton").className = classes.replace(new RegExp("active", "g"), "");

  classes = document.querySelector("#navMenuButton").className;
  if (classes.indexOf("active") === -1) {
    document.querySelector("#navMenuButton").className = classes + " active";
  }
};

// ---------------------- RANDOM SPECIALS INTEGRATION ----------------------
document.addEventListener("DOMContentLoaded", function () {
  showLoading("#main-content");

  // Get all categories
  $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowHomeHTML, true);
});

// Build home page with random Specials
function buildAndShowHomeHTML(categories) {
  $ajaxUtils.sendGetRequest(homeHtmlUrl, function (homeHtml) {
    var chosenCategory = chooseRandomCategory(categories);
    var chosenCategoryShortName = "'" + chosenCategory.short_name + "'";

    var homeHtmlToInsert = insertProperty(homeHtml, "randomCategoryShortName", chosenCategoryShortName);
    insertHtml("#main-content", homeHtmlToInsert);
  }, false);
}

// Pick a random category object
function chooseRandomCategory(categories) {
  var randomIndex = Math.floor(Math.random() * categories.length);
  return categories[randomIndex];
}

// ---------------------- MENU FUNCTIONS ----------------------
dc.loadMenuCategories = function () {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML, true);
};

dc.loadMenuItems = function (categoryShort) {
  showLoading("#main-content");
  $ajaxUtils.sendGetRequest(menuItemsUrl + categoryShort + ".json", buildAndShowMenuItemsHTML, true);
};

// Build categories page
function buildAndShowCategoriesHTML(categories) {
  $ajaxUtils.sendGetRequest(categoriesTitleHtml, function (categoriesTitleHtml) {
    $ajaxUtils.sendGetRequest(categoryHtml, function (categoryHtml) {
      switchMenuToActive();
      var categoriesViewHtml = buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml);
      insertHtml("#main-content", categoriesViewHtml);
    }, false);
  }, false);
}

function buildCategoriesViewHtml(categories, categoriesTitleHtml, categoryHtml) {
  var finalHtml = categoriesTitleHtml + "<section class='row'>";
  for (var i = 0; i < categories.length; i++) {
    var html = categoryHtml;
    html = insertProperty(html, "name", categories[i].name);
    html = insertProperty(html, "short_name", categories[i].short_name);
    finalHtml += html;
  }
  finalHtml += "</section>";
  return finalHtml;
}

// Build single category menu items page
function buildAndShowMenuItemsHTML(categoryMenuItems) {
  $ajaxUtils.sendGetRequest(menuItemsTitleHtml, function (menuItemsTitleHtml) {
    $ajaxUtils.sendGetRequest(menuItemHtml, function (menuItemHtml) {
      switchMenuToActive();
      var menuItemsViewHtml = buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml);
      insertHtml("#main-content", menuItemsViewHtml);
    }, false);
  }, false);
}

function buildMenuItemsViewHtml(categoryMenuItems, menuItemsTitleHtml, menuItemHtml) {
  menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "name", categoryMenuItems.category.name);
  menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "special_instructions", categoryMenuItems.category.special_instructions);

  var finalHtml = menuItemsTitleHtml + "<section class='row'>";
  var menuItems = categoryMenuItems.menu_items;
  var catShortName = categoryMenuItems.category.short_name;

  for (var i = 0; i < menuItems.length; i++) {
    var html = menuItemHtml;
    html = insertProperty(html, "short_name", menuItems[i].short_name);
    html = insertProperty(html, "catShortName", catShortName);
    html = insertItemPrice(html, "price_small", menuItems[i].price_small);
    html = insertItemPortionName(html, "small_portion_name", menuItems[i].small_portion_name);
    html = insertItemPrice(html, "price_large", menuItems[i].price_large);
    html = insertItemPortionName(html, "large_portion_name", menuItems[i].large_portion_name);
    html = insertProperty(html, "name", menuItems[i].name);
    html = insertProperty(html, "description", menuItems[i].description);

    if (i % 2 !== 0) html += "<div class='clearfix visible-lg-block visible-md-block'></div>";
    finalHtml += html;
  }

  finalHtml += "</section>";
  return finalHtml;
}

function insertItemPrice(html, pricePropName, priceValue) {
  if (!priceValue) return insertProperty(html, pricePropName, "");
  priceValue = "$" + priceValue.toFixed(2);
  return insertProperty(html, pricePropName, priceValue);
}

function insertItemPortionName(html, portionPropName, portionValue) {
  if (!portionValue) return html;
  portionValue = "(" + portionValue + ")";
  return insertProperty(html, portionPropName, portionValue);
}

global.$dc = dc;

})(window);
