import { For, createResource, createSignal } from "solid-js";
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
interface MerchandiseDTO {
  merchandises: Merchandise[],
  minum_threshold: number,
}
function App() {
  let formData = {
    name: document.createElement('input'),
    price: document.createElement('input'),
    amount: document.createElement('input'),
    minimum_threshold_price: document.createElement('input'),
    discount: document.createElement('input'),
  };
  const [greetMsg, setGreetMsg] = createSignal("");
  const [candidateMerchandise, setcandidateMerchandise] = createStore<Merchandise[]>([]);
  const [name, setName] = createSignal("");
  const [merchandise, setmerchandise] = createStore<Merchandise[]>([]);


  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name: name() }));
  }

  const caculateDiscount = async () => {
    const dto: MerchandiseDTO = {
      merchandises: candidateMerchandise,
      minum_threshold:parseFloat(formData.minimum_threshold_price.value),
    }
    const mer = await invoke<Merchandise[]>("max_discount", { merchandiseDto: dto });
    setmerchandise(mer);
    return mer;
  }


  const getMerchandiseInfo = () => {
    return {
      name: formData.name.value,
      price: parseInt(formData.price.value),
      amount: parseInt(formData.amount.value),
    }
  }
  const enterMerchandise = () => {
    // const newMerchandise: Merchandise = {
    //   name: name(),
    //   price: price(),
    //   amount: amount(),
    // }
    setcandidateMerchandise(old => [...old, getMerchandiseInfo()])
  }

  return (
    <>
      <h1>Max Your Discount!</h1>
      <div class="flex justify-center">
        <input
          ref={formData!.name}
          //onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter merchandise name..."
        />
        <input
          ref={formData!.price}
          //onChange={(e) => setPrice(parseInt(e.currentTarget.value))}
          placeholder="Enter merchandise amount..."
        />
        <input
          ref={formData!.amount}
          //onChange={(e) => setAmount(parseInt(e.currentTarget.value))}
          placeholder="Enter merchandise price..."
        />

        <button onClick={enterMerchandise} type="button">Enter</button>
        <button onClick={caculateDiscount} type="button">Caculate</button>

      </div>
      <div class="flex justify-center">
      <input
          ref={formData!.minimum_threshold_price}
          placeholder="輸入最低限度金額..."
        />
        <input
          ref={formData!.discount}
          placeholder="輸入折扣金額..."
        />
      </div>
      <div class="bg-red-500"><p>i am here{formData.name.value}</p></div>
      <div class="flex justify-center flex-wrap">
        <For each={candidateMerchandise}>
          {(merchandise) => (<div class="grid grid-cols-3 gap-4 w-3/4">
            <p>{merchandise.name}</p>
            <p>{merchandise.price}</p>
            <p>{merchandise.amount}</p>
          </div>
          )
          }
        </For>
      </div>
      <For each={merchandise}>
        {(merchandise) => (<div class="grid grid-cols-3 gap-4 w-3/4">
          <p>{merchandise.name}</p>
          <p>{merchandise.price}</p>
          <p>{merchandise.amount}</p>
        </div>
        )
        }
      </For>
    </>
  );
}

export default App;
