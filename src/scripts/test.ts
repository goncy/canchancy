import readline from "readline/promises";

import {getCourtsData} from "@/lib/atc";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const lugares = {
  "1": {name: "Castro", value: "1061"},
  "2": {name: "Golazo", value: "1625"},
  "3": {name: "Comu Caba", value: "comu-caba"},
} as const;

async function main() {
  console.log("\n🎾 Bienvenido a Canchancy 🎾\n");

  // Preguntar por el lugar
  console.log("Lugares disponibles:");
  Object.entries(lugares).forEach(([key, lugar]) => {
    console.log(`${key}. ${lugar.name}`);
  });

  const lugarInput = await rl.question("\nSelecciona el lugar (1-3): ");
  const lugar = lugares[lugarInput as keyof typeof lugares];

  if (!lugar) {
    console.error("❌ Lugar inválido");
    rl.close();

    return;
  }

  // Preguntar por la fecha
  const fechaInput = await rl.question("\nIngresa la fecha (YYYY-MM-DD): ");
  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!fechaRegex.test(fechaInput)) {
    console.error("❌ Formato de fecha inválido. Usa YYYY-MM-DD");
    rl.close();

    return;
  }

  try {
    console.log("\nBuscando canchas disponibles...\n");
    const resultado = await getCourtsData(lugar.value, fechaInput);

    console.log(`📍 Canchas disponibles en ${resultado.name} para el ${fechaInput}:\n`);

    resultado.courts.forEach((court) => {
      console.log(`🎾 ${court.name}:`);
      console.log(`   Horarios: ${court.slots.join(", ")}\n`);
    });
  } catch (error) {
    console.error("❌ Error al obtener los datos:", error);
  } finally {
    rl.close();
  }
}

main();
