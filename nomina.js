const readline = require('readline');

class Empleado {
    constructor(nombre, salario, estrato, esRural, hijosPrimaria, hijosSecundaria, hijosUniversidad, esExtranjero, genero) {
        this.nombre = nombre;
        this.salario = salario;
        this.estrato = estrato;
        this.esRural = esRural;
        this.hijosPrimaria = hijosPrimaria;
        this.hijosSecundaria = hijosSecundaria;
        this.hijosUniversidad = hijosUniversidad;
        this.esExtranjero = esExtranjero;
        this.genero = genero;

        this.subsidioEstrato = this.calcularSubsidioEstrato();
        this.subsidioRural = esRural ? 35000 : 0;
        this.subsidioHijos = 0;
        this.costoVuelos = 0;
    }

    calcularSubsidioEstrato() {
        if (this.estrato === 1) return this.salario * 0.15;
        if (this.estrato === 2) return this.salario * 0.10;
        if (this.estrato === 3) return this.salario * 0.05;
        return 0;
    }

    calcularSubsidioHijos(x, z, y) {
        this.subsidioHijos = (this.hijosPrimaria * x) + (this.hijosSecundaria * z) + (this.hijosUniversidad * y);
    }

    calcularCostoVuelos(costoVuelo) {
        if (this.esExtranjero) {
            this.costoVuelos = 2 * costoVuelo;
        }
    }

    calcularCostoTotal() {
        return this.salario + this.subsidioEstrato + this.subsidioRural + this.subsidioHijos + this.costoVuelos;
    }
}

class NodoEmpleado {
    constructor(empleado) {
        this.empleado = empleado;
        this.siguiente = null;
    }
}

class ListaEmpleados {
    constructor() {
        this.cabeza = null;
    }

    agregarEmpleado(empleado) {
        const nuevoNodo = new NodoEmpleado(empleado);
        if (!this.cabeza) {
            this.cabeza = nuevoNodo;
        } else {
            let actual = this.cabeza;
            while (actual.siguiente) {
                actual = actual.siguiente;
            }
            actual.siguiente = nuevoNodo;
        }
    }

    calcularTotales(x, z, y, costoVuelo) {
        let actual = this.cabeza;
        let totalNomina = 0;
        let totalNominaHombres = 0;
        let totalNominaMujeres = 0;
        let empleadoMasCostoso = null;
        let totalSubsidiosSecundaria = 0;
        let totalCostosVuelos = 0;

        while (actual) {
            const empleado = actual.empleado;
            empleado.calcularSubsidioHijos(x, z, y);
            empleado.calcularCostoVuelos(costoVuelo);
            const costoTotal = empleado.calcularCostoTotal();

            totalNomina += costoTotal;
            if (empleado.genero === "M") {
                totalNominaHombres += costoTotal;
            } else {
                totalNominaMujeres += costoTotal;
            }

            if (!empleadoMasCostoso || costoTotal > empleadoMasCostoso.calcularCostoTotal()) {
                empleadoMasCostoso = empleado;
            }

            totalSubsidiosSecundaria += empleado.hijosSecundaria * z;
            totalCostosVuelos += empleado.costoVuelos;

            actual = actual.siguiente;
        }

        return {
            totalNomina,
            totalNominaHombres,
            totalNominaMujeres,
            empleadoMasCostoso: empleadoMasCostoso ? empleadoMasCostoso.nombre : null,
            totalSubsidiosSecundaria,
            totalCostosVuelos
        };
    }
}

function main() {
    const listaEmpleados = new ListaEmpleados();
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("Ingrese el subsidio por cada hijo en primaria: ", (x) => {
        rl.question("Ingrese el subsidio por cada hijo en secundaria: ", (z) => {
            rl.question("Ingrese el subsidio por cada hijo en universidad: ", (y) => {
                rl.question("Ingrese el costo de un vuelo para un empleado extranjero: ", (costoVuelo) => {
                    rl.question("Ingrese el número de empleados: ", (numEmpleados) => {
                        agregarEmpleados(listaEmpleados, rl, x, z, y, costoVuelo, numEmpleados);
                    });
                });
            });
        });
    });
}

function agregarEmpleados(listaEmpleados, rl, x, z, y, costoVuelo, numEmpleados) {
    let contador = 0;

    function agregarEmpleado() {
        rl.question("Ingrese el nombre del empleado: ", (nombre) => {
            rl.question("Ingrese el salario del empleado: ", (salario) => {
                rl.question("Ingrese el estrato del empleado (1, 2 o 3): ", (estrato) => {
                    rl.question("¿El empleado vive en zona rural? (si/no): ", (esRural) => {
                        const esRuralBoolean = esRural.toLowerCase() === "si";
                        rl.question("Ingrese el número de hijos en primaria: ", (hijosPrimaria) => {
                            rl.question("Ingrese el número de hijos en secundaria: ", (hijosSecundaria) => {
                                rl.question("Ingrese el número de hijos en universidad: ", (hijosUniversidad) => {
                                    rl.question("¿El empleado es extranjero? (si/no): ", (esExtranjero) => {
                                        const esExtranjeroBoolean = esExtranjero.toLowerCase() === "si";
                                        rl.question("Ingrese el género del empleado (M/F): ", (genero) => {
                                            const empleado = new Empleado(nombre, parseFloat(salario), parseInt(estrato), esRuralBoolean, parseInt(hijosPrimaria), parseInt(hijosSecundaria), parseInt(hijosUniversidad), esExtranjeroBoolean, genero.toUpperCase());
                                            listaEmpleados.agregarEmpleado(empleado);

                                            contador++;
                                            if (contador < numEmpleados) {
                                                agregarEmpleado();
                                            } else {
                                                mostrarResultados(listaEmpleados, x, z, y, costoVuelo);
                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    agregarEmpleado();
}

function mostrarResultados(listaEmpleados, x, z, y, costoVuelo) {
    const resultados = listaEmpleados.calcularTotales(x, z, y, costoVuelo);
    console.log("Resultados:");
    console.log("Total de nómina: $" + resultados.totalNomina);
    console.log("Total de nómina para hombres: $" + resultados.totalNominaHombres);
    console.log("Total de nómina para mujeres: $" + resultados.totalNominaMujeres);
    console.log("Empleado más costoso: " + resultados.empleadoMasCostoso);
    console.log("Total de subsidios para hijos en secundaria: $" + resultados.totalSubsidiosSecundaria);
    console.log("Total de costos por vuelos para empleados extranjeros: $" + resultados.totalCostosVuelos);
}
main()