const readline = require('readline');



class Nodo {
    constructor(valor) {
        this.valor = valor;
        this.siguiente = null;
    }
}

// Clase Persona
class Persona {
    constructor(nombre, edad, genero, regimen, ingreso, nivelSisben) {
        this.nombre = nombre;
        this.edad = edad;
        this.genero = genero;
        this.regimen = regimen;
        this.ingreso = ingreso;
        this.nivelSisben = nivelSisben;
    }

    calcularDescuento(costoPrueba) {
        let descuento = 0;
        if (this.nivelSisben) {
            const tasasDescuento = { 'A': 0.10, 'B1': 0.05, 'B2': 0.02 };
            descuento = costoPrueba * (tasasDescuento[this.nivelSisben] || 0);
        }
        if (this.regimen === 'contributivo' && this.ingreso > 3900000) {
            descuento += costoPrueba * ((this.ingreso - 3900000) / 3900000) * 0.10; 
        }
        return descuento;
    }
}

// Clase Laboratorio
class Laboratorio {
    constructor(nombre) {
        this.nombre = nombre;
        this.pruebas = new ListaEnlazada(); 
    }

    agregarPrueba(prueba) {
        this.pruebas.agregarAlFinal(prueba); 
    }
}

// Clase Prueba
class Prueba {
    constructor(nombre, tipo, costo) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.costo = costo;
        this.personas = new ListaEnlazada(); 
    }

    agregarPersona(persona) {
        this.personas.agregarAlFinal(persona); 
    }

    calcularCostoFinal() {
        let totalCosto = 0;
        let descuentosPorSisben = {};
        let actual = this.personas.cabeza; 
        while (actual) {
            if (actual.valor instanceof Persona) { 
                let descuento = actual.valor.calcularDescuento(this.costo); 
                descuentosPorSisben[nivelSisben] = (descuentosPorSisben[nivelSisben] || 0) + descuento;
                totalCosto += this.costo - descuento;
            } else {
                console.log("¡Error! El valor no es una instancia de Persona.");
            }
            actual = actual.siguiente; // Pasamos al siguiente nodo
        }
        return { totalCosto, descuentosPorSisben };
    }
}

// Clase Farmaceutica
class Farmaceutica {
    constructor() {
        this.laboratorios = new ListaEnlazada(); 
    }

    agregarLaboratorio(laboratorio) {
        this.laboratorios.agregarAlFinal(laboratorio); 
    }

    calcularIngresosTotales() {
        let ingresosTotales = 0;
        let ingresosPorRegimen = { contributivo: 0, subsidiado: 0 };
        let ingresosPorTipoExamen = {};
        let descuentosPorSisben = 0;
        let totalIngresosLaboratorio = 0;
        let laboratoriosPorDebajo = [];
        let laboratoriosPorEncima = [];
        let actualLab = this.laboratorios.cabeza; 
        while (actualLab) {
            let actualPrueba = actualLab.valor.pruebas.cabeza; 
            while (actualPrueba) {
                let resultado = actualPrueba.valor.calcularCostoFinal();
                ingresosTotales += resultado.totalCosto;
                totalIngresosLaboratorio += resultado.totalCosto;

                let actualPersona = actualPrueba.valor.personas.cabeza; 
                while (actualPersona) {
                    if (actualPersona.valor instanceof Persona) { 
                        ingresosPorRegimen[actualPersona.valor.regimen] += actualPrueba.valor.costo - actualPersona.valor.calcularDescuento(actualPrueba.valor.costo);
                    } else {
                        console.log("¡Error! El valor no es una instancia de Persona.");
                    }
                    actualPersona = actualPersona.siguiente; 
                }

                ingresosPorTipoExamen[actualPrueba.valor.tipo] = (ingresosPorTipoExamen[actualPrueba.valor.tipo] || 0) + resultado.totalCosto;

                for (const nivel in resultado.descuentosPorSisben) {
                    descuentosPorSisben += resultado.descuentosPorSisben[nivel];
                }

                actualPrueba = actualPrueba.siguiente; 
            totalIngresosLaboratorio /= actualLab.valor.pruebas.longitud; 
            if (totalIngresosLaboratorio < ingresosTotales) {
                laboratoriosPorDebajo.push(actualLab.valor.nombre);
            } else if (totalIngresosLaboratorio > ingresosTotales) {
                laboratoriosPorEncima.push(actualLab.valor.nombre);
            }

            actualLab = actualLab.siguiente; 
        }

        return {
            ingresosTotales,
            ingresosPorRegimen,
            ingresosPorTipoExamen,
            descuentosPorSisben,
            promedioIngresosLaboratorio: ingresosTotales / this.laboratorios.longitud,
            laboratoriosPorDebajo,
            laboratoriosPorEncima
        };
    }
}

// Clase ListaEnlazada
class ListaEnlazada {
    constructor() {
        this.cabeza = null;
        this.longitud = 0;
    }

    // Método para agregar un elemento al final de la lista
    agregarAlFinal(valor) {
        const nuevoNodo = new Nodo(valor);

        if (!this.cabeza) {
            this.cabeza = nuevoNodo;
        } else {
            let actual = this.cabeza;
            while (actual.siguiente) {
                actual = actual.siguiente;
            }
            actual.siguiente = nuevoNodo;
        }

        this.longitud++;
    }
}

// Función principal
function main() {
    const readline = require('readline-sync'); 
    let farmaceutica = new Farmaceutica();
    let seguir = true;

    while (seguir) {
        let nombreLaboratorio = readline.question('Nombre del laboratorio: ');
        let laboratorio = new Laboratorio(nombreLaboratorio);
        farmaceutica.agregarLaboratorio(laboratorio);

        let agregarPrueba = true;
        while (agregarPrueba) {
            let nombrePrueba = readline.question('Nombre de la prueba: ');
            let tipoPrueba = readline.question('Tipo de prueba: ');
            let costoPrueba = parseFloat(readline.question('Costo de la prueba: '));
            let prueba = new Prueba(nombrePrueba, tipoPrueba, costoPrueba);
            laboratorio.agregarPrueba(prueba);

            let agregarPersona = true;
            while (agregarPersona) {
                let nombrePersona = readline.question('Nombre de la persona: ');
                let edadPersona = parseInt(readline.question('Edad de la persona: '));
                let generoPersona = readline.question('Género de la persona (M/F): ').toUpperCase();
                let regimenPersona = readline.question('Régimen (subsidiado/contributivo): ').toLowerCase(); // Convertir a minúsculas
                let ingresoPersona = regimenPersona === 'contributivo' ? parseFloat(readline.question('Ingreso mensual de la persona: ')) : null;
                let nivelSisben = regimenPersona === 'subsidiado' ? readline.question('Nivel Sisben (A/B1/B2): ').toUpperCase() : null; // Convertir a mayúsculas

                let persona = new Persona(nombrePersona, edadPersona, generoPersona, regimenPersona, ingresoPersona, nivelSisben);
                prueba.agregarPersona(persona);

                agregarPersona = readline.question('¿Agregar otra persona a esta prueba? (s/n): ').toLowerCase() === 's';
            }
            agregarPrueba = readline.question('¿Agregar otra prueba al laboratorio? (s/n): ').toLowerCase() === 's';
        }
        seguir = readline.question('¿Registrar otro laboratorio? (s/n): ').toLowerCase() === 's';
    }

    let resultados = farmaceutica.calcularIngresosTotales();
console.log('1. Ingresos totales por concepto de pruebas de laboratorio: $' + resultados.ingresosTotales.toFixed(2));
console.log('2. Ingresos totales por régimen:');
console.log('   - Contributivo: $' + resultados.ingresosPorRegimen.contributivo.toFixed(2));
console.log('   - Subsidiado: $' + resultados.ingresosPorRegimen.subsidiado.toFixed(2));
console.log('3. Tipo de examen más rentable: ' + (resultados.ingresosPorTipoExamen ? Object.keys(resultados.ingresosPorTipoExamen)[0] : 'Ninguno'));
console.log('4. Total de descuentos brindados según el Sisben: $' + resultados.descuentosPorSisben.toFixed(2));
console.log('5. Promedio de ingresos por laboratorio: $' + resultados.promedioIngresosLaboratorio.toFixed(2));
console.log('6. Laboratorios por debajo del promedio: ' + (resultados.laboratoriosPorDebajo.length > 0 ? resultados.laboratoriosPorDebajo.join(', ') : 'Ninguno'));
console.log('7. Laboratorios por encima del promedio: ' + (resultados.laboratoriosPorEncima.length > 0 ? resultados.laboratoriosPorEncima.join(', ') : 'Ninguno'));

}

main();

