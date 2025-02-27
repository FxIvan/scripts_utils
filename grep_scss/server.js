const fs = require('fs');
const path = require('path');

// Rutas donde buscar archivos .scss
const directories = [
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base/chains',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base/features',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base/features/calendar',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base/features/cards',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base/features/elections',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base/features/feeds',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base/features/feriados',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base/features/laws',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base/features/sports/brackets',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base/features/sports/draws',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base/features/sports/tenis',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base/features/videos',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base/framework',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/base/layouts',
    '/home/almendra/Infobae-PageBuilder-Fusion-Features/src/websites/infobae'
];

// Variables de colores a buscar
const colorVariables = [
    '--bg', '--bg-color', '--black-100', '--blue-100', '--blue-50',
    '--cyan-100', '--dark-60', '--dark-70', '--dark-80', '--dark-85',
    '--dark-90', '--dark-blue-100', '--election-gray-10', '--election-gray-40',
    '--election-gray-90', '--gray-0', '--gray-10', '--gray-20', '--gray-30',
    '--gray-40', '--gray-50', '--gray-60', '--gray-70', '--gray-80',
    '--gray-sport-80', '--gray-85', '--gray-90', '--gray-100', '--gray-110',
    '--gray-115', '--gray-especial-deck', '--gray-especial-hl', '--green-10',
    '--green-50', '--green-100', '--headlines', '--orange-0', '--orange-10',
    '--orange-20', '--orange-30', '--orange-40', '--orange-50', '--orange-60',
    '--orange-70', '--orange-80', '--orange-90', '--orange-100', '--orange-100-sport',
    '--orange-110', '--orange-120', '--orange-130', '--orange-140', '--red-10',
    '--red-20', '--red-50', '--red-90', '--red-100', '--white-100',
    '--white-105', '--yellow-50', '--yellow-100', '--border-web-history',
    '--background-shared-btn', '--sub-headlines', '--border-newsletter',
    '--background-preview-modal', '--red-permanent', '--chain-with-border',
    '--newsletter-btn-color', '--newsletter-btn-icon-path', '--background-podcast',
    '--nav-podcast-border', '--minute-marker-border', '--new-btn-text',
    '--background-btn-game-card', '--border-btn-game-card', '--color-btn-game-card',
    '--background-btn-game-card-hover', '--border-btn-game-card-hover', '--masthead-navbar-shadow',
    '--shared-icon-date', '--button-alert-background', '--button-alert-text',
    '--button-alert-border', '--button-alert-hover-bg', '--button-alert-hover-bor',
    '--border-titlebar', '--msg-text-color', '--switch-background',
    '--circle-background-enable', '--circle-background-disable', '--bg-menu',
    '--border-input', '--color-text-input', '--border-btn-identity',
    '--border-hover-identity', '--background-color-identity', '--text-color-disabled',
    '--text-color-continue', '--mhh-nav-item', '--shadow-nav', '--border-tooltip',
    '--text-tooltip', '--color-text-perfil', '--color-icon-avatar',
    '--background-icon-avatar', '--head-story-title', '--fill-icon-show-minus',
    '--border-bottom-color', '--skeleton-bg-1', '--skeleton-bg-2',
    '--bg-color-bajalibros', '--bg-exclusive', '--bg-background-face',
    '--border-btn-face', '--color-txt-face', '--bg-tooltip-password',
    '--shadow-tooltip-password', '--background-queryly-input', '--recipes-card-tag',
    '--recipes-card-tag-color', '--recipes-no-results-border'
];

// Función para buscar las variables en los archivos .scss
async function searchColorVariables(isAmp) {
    const regex = new RegExp(colorVariables.join('|'), 'g');
    const hexColorRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})/g; // Regex para colores hexadecimales
    const results = {};
    const hexColorsFound = new Set(); // Conjunto para almacenar colores hexadecimales encontrados
    const colorVariableList = new Set(); // Conjunto para almacenar todas las variables de color encontradas

    for (const dir of directories) {
        const files = await fs.promises.readdir(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = await fs.promises.stat(filePath);

            if (stat.isFile() && file.endsWith('.scss') && (!isAmp || file.endsWith('Amp.scss'))) {
                const data = await fs.promises.readFile(filePath, 'utf8');
                const matches = data.match(regex);
                
                if (matches) {
                    results[filePath] = [...new Set(matches)];
                    matches.forEach(variable => colorVariableList.add(variable)); // Agregar variables a la lista
                }

                // Buscar colores hexadecimales
                const hexMatches = data.match(hexColorRegex);
                if (hexMatches) {
                    for (const hex of hexMatches) {
                        const index = data.indexOf(hex);
                        const colorValue = data.slice(index, index + 7); // 7 caracteres: # seguido de 6
                        if (!results[filePath]) {
                            results[filePath] = [];
                        }
                        results[filePath].push(colorValue);
                        hexColorsFound.add(colorValue); // Agregar al conjunto de colores hexadecimales
                    }
                }
            }
        }
    }

    return { results, hexColorsFound, colorVariableList };
}

// Función para guardar resultados en JSON y HTML
async function saveResults(isAmp) {
    const { results, hexColorsFound, colorVariableList } = await searchColorVariables(isAmp);
    
    // Guardar en archivo JSON
    fs.writeFileSync('results.json', JSON.stringify(results, null, 2), 'utf8');
    console.log('Resultados guardados en results.json');

    // Generar HTML
    let htmlContent = `
    <html>
    <head>
        <title>Resultados de Búsqueda de Variables</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            pre { background-color: #f4f4f4; padding: 10px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <h1>Resultados de Búsqueda de Variables en SCSS</h1>
        <ul>
    `;

    for (const [filePath, variables] of Object.entries(results)) {
        htmlContent += `<li><strong>${filePath}</strong><pre>${variables.join(', ')}</pre></li>`;
    }

    // Agregar la lista de todas las variables de color encontradas
    if (colorVariableList.size > 0) {
        htmlContent += `
            <h2>Variables de Color Usadas:</h2>
            <pre>${Array.from(colorVariableList).join(', ')}</pre>
        `;
    }

    // Agregar resumen de colores hexadecimales
    if (hexColorsFound.size > 0) {
        htmlContent += `
            <h2>Colores Hexadecimales Encontrados:</h2>
            <pre>${Array.from(hexColorsFound).join(', ')}</pre>
        `;
    }

    htmlContent += `
        </ul>
    </body>
    </html>
    `;

    fs.writeFileSync('results.html', htmlContent, 'utf8');
    console.log('Resultados guardados en results.html');
}

// Comprobar si se pasó el argumento "amp"
const isAmp = process.argv.includes('amp');
saveResults(isAmp);
