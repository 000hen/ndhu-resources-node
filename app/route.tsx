import { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
    return [
        { title: "東華資源庫 - 公開資源，節省金援" },
        { name: "description", content: "東華資源庫提供您一個可以下載資源的地方！" },
    ];
};

export default function Index() {
    return <div>
        <h1>Hi! 👋</h1>
        <p>歡迎來到東華資源庫！在這裡我們提供您免費的資源(僅用於教學)。若您希望下載或提供資源，請使用東華的 Google 帳戶登入此平台，以確認您的身分。</p>

        <h2>版權提示</h2>
        <p>
            請注意！
            依據依著作權法第46條教學之合理使用規定，提供用於教學用途的資源可為合理使用。
            若您對於我們提供的資源有版權疑慮，或是您希望我們下架您所著作的資源，請聯繫 copyright@muisnowdevs.one ，我們會協助您釐清版權的使用或是刪除/下架該資源。
        </p>

        <h2>開發資訊</h2>
        <p>東華資源庫為學生自行開發之程式，與國立東華大學並無任何關聯。</p>
        <p>此程式預計作為開源程式釋出，您可以協助我們開發您亦可製作您自己的東華資源庫。</p>
    </div>;
}