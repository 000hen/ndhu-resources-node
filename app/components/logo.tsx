export default function LogoComponent() {
    return <div className="flex flex-col">
        <span className="mb-0 text-4xl font-bold">東華<span className="px-2 py-1 mx-2 bg-blue-600 text-white">資源庫</span></span>
        <span className="badge badge-info mt-1 tooltip" data-tip="目前為測試版本">Preview</span>
    </div>;
}