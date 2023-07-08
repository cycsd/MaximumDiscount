import { For, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";
import { create } from "domain";

interface Merchandise {
  name: string,
  price: number,
  amount: number,
}
function App() {
  const [greetMsg, setGreetMsg] = createSignal("");
  const [candidateMerchandise, setcandidateMerchandise] = createSignal<Merchandise[]>([]);
  const [name, setName] = createSignal("");
  const [price, setPrice] = createSignal(0);
  const [amount, setAmount] = createSignal(0);

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name: name() }));
  }
  const enterMerchandise = () => {
    const newMerchandise: Merchandise = {
      name: name(),
      price: price(),
      amount: amount(),
    }
    setcandidateMerchandise(old => [...old,newMerchandise])
  }

  return (
    <>
      <h1>Max Your Discount!</h1>
      <div class="flex justify-center">
        <input
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter merchandise name..."
        />
        <input
          onChange={(e) => setPrice(parseInt(e.currentTarget.value))}
          placeholder="Enter merchandise amount..."
        />
        <input
          onChange={(e) => setAmount(parseInt(e.currentTarget.value))}
          placeholder="Enter merchandise price..."
        />
        <button onClick={enterMerchandise} type="button">Enter</button>
        <button onClick={greet} type="submit">Greet</button>
        <p>{greetMsg()}</p>
      </div>
      <div class="flex justify-center">
        <For each={candidateMerchandise()}>
          {(merchandise) => (<div>
            <p>{merchandise.name}</p>
            <p>{merchandise.price}</p>
            <p>{merchandise.amount}</p>
          </div>
          )
          }
        </For>
      </div>
    </>
  );
}

export default App;
