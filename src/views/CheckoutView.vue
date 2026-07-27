<script setup>
import { ref, computed } from 'vue'

// --- STATE KERANJANG & RINGKASAN ---
const cartItems = ref([
  {
    id: 1,
    name: 'Glenfiddich 12 Years',
    qty: 1,
    price: 725000,
    image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 2,
    name: 'Patrón Silver 750ml',
    qty: 1,
    price: 1250000,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=200'
  },
  {
    id: 3,
    name: 'Bombay Sapphire Gin',
    qty: 1,
    price: 385000,
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&q=80&w=200'
  }
])

const shippingFee = ref(15000)
const discount = ref(36000)

const subtotal = computed(() => {
  return cartItems.value.reduce((acc, item) => acc + item.price * item.qty, 0)
})

const total = computed(() => {
  return subtotal.value + shippingFee.value - discount.value
})

// --- STATE METODE PEMBAYARAN ---
const selectedPayment = ref('transfer')
const paymentMethods = [
  { id: 'transfer', name: 'Transfer Bank — BCA, Mandiri, BNI' },
  { id: 'ewallet', name: 'E-Wallet — OVO, GoPay, DANA' },
  { id: 'cod', name: 'Bayar di Tempat (COD)' }
]

// --- STATE ALAMAT ---
const addresses = ref([
  {
    id: 1,
    label: 'Rumah',
    isPrimary: true,
    name: 'Budi Santoso',
    phone: '0812-3456-7890',
    address: 'Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan, DKI Jakarta 12150',
    city: 'Jakarta Selatan',
    postalCode: '12150'
  },
  {
    id: 2,
    label: 'Kantor',
    isPrimary: false,
    name: 'Budi Santoso',
    phone: '0812-3456-7890',
    address: 'Jl. Sudirman No. 45, Setiabudi, Jakarta Selatan 12930',
    city: 'Jakarta Selatan',
    postalCode: '12930'
  }
])

// Alamat aktif yang terpilih untuk pengiriman
const activeAddressId = ref(1)
const tempSelectedAddressId = ref(1)

const selectedAddress = computed(() => {
  return addresses.value.find(a => a.id === activeAddressId.value) || addresses.value[0]
})

// --- STATE MODAL ---
const showSelectModal = ref(false)
const showFormModal = ref(false)
const isEditing = ref(false)

// Form Alamat State
const addressForm = ref({
  id: null,
  label: '',
  name: '',
  phone: '',
  address: '',
  city: '',
  postalCode: ''
})

// --- HANDLERS MODAL & ALAMAT ---
const openSelectAddressModal = () => {
  tempSelectedAddressId.value = activeAddressId.value
  showSelectModal.value = true
}

const confirmAddressSelection = () => {
  activeAddressId.value = tempSelectedAddressId.value
  showSelectModal.value = false
}

const openAddModal = () => {
  isEditing.value = false
  addressForm.value = {
    id: null,
    label: 'Alamat Baru',
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: ''
  }
  showSelectModal.value = false
  showFormModal.value = true
}

const openEditModal = (addr) => {
  isEditing.value = true
  addressForm.value = { ...addr }
  showSelectModal.value = false
  showFormModal.value = true
}

const saveAddress = () => {
  if (isEditing.value) {
    const idx = addresses.value.findIndex(a => a.id === addressForm.value.id)
    if (idx !== -1) {
      addresses.value[idx] = { ...addressForm.value }
    }
  } else {
    const newId = Date.now()
    const newAddress = {
      ...addressForm.value,
      id: newId,
      isPrimary: addresses.value.length === 0
    }
    addresses.value.push(newAddress)
    tempSelectedAddressId.value = newId
  }
  showFormModal.value = false
  showSelectModal.value = true
}

const deleteAddress = (id) => {
  if (addresses.value.length <= 1) {
    alert('Minimal harus ada 1 alamat pengiriman.')
    return
  }
  addresses.value = addresses.value.filter(a => a.id !== id)
  if (tempSelectedAddressId.value === id) {
    tempSelectedAddressId.value = addresses.value[0].id
  }
  if (activeAddressId.value === id) {
    activeAddressId.value = addresses.value[0].id
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#FAF6F0] py-8 px-4 sm:px-6 lg:px-8 font-sans text-gray-900">
    <div class="max-w-6xl mx-auto space-y-6">
      
      <!-- HEADER PAGE -->
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900">Checkout</h1>
        <p class="text-xs text-gray-500 mt-1">Tinjau pesanan dan selesaikan pembayaran kamu.</p>
      </div>

      <!-- MAIN CONTENT GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        <!-- KOLOM KIRI (BARANG, ALAMAT, PEMBAYARAN) -->
        <div class="lg:col-span-8 space-y-5">
          
          <!-- 1. KERANJANG BELANJA -->
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 class="text-sm font-bold text-gray-900 mb-4">Keranjang Belanja ({{ cartItems.length }})</h2>
            
            <div class="divide-y divide-gray-100">
              <div 
                v-for="item in cartItems" 
                :key="item.id" 
                class="py-3 flex items-center justify-between first:pt-0 last:pb-0"
              >
                <div class="flex items-center gap-3">
                  <img :src="item.image" :alt="item.name" class="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                  <div>
                    <h3 class="text-xs font-bold text-gray-800">{{ item.name }}</h3>
                    <p class="text-[11px] text-gray-400 mt-0.5">{{ item.qty }} × Rp {{ item.price.toLocaleString('id-ID') }}</p>
                  </div>
                </div>
                <span class="text-xs font-bold text-gray-900">
                  Rp {{ (item.price * item.qty).toLocaleString('id-ID') }}
                </span>
              </div>
            </div>
          </div>

          <!-- 2. ALAMAT PENGIRIMAN -->
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-sm font-bold text-gray-900">Alamat Pengiriman</h2>
              <button 
                @click="openSelectAddressModal" 
                class="text-xs font-bold text-[#E25C38] hover:underline"
              >
                Ubah
              </button>
            </div>

            <div v-if="selectedAddress" class="text-xs text-gray-600 space-y-1">
              <p class="font-bold text-gray-800">
                {{ selectedAddress.name }} <span class="font-normal text-gray-400">· {{ selectedAddress.phone }}</span>
              </p>
              <p class="text-gray-500 leading-relaxed">{{ selectedAddress.address }}</p>
            </div>
          </div>

          <!-- 3. METODE PEMBAYARAN -->
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h2 class="text-sm font-bold text-gray-900 mb-3">Metode Pembayaran</h2>

            <div class="space-y-2.5">
              <label
                v-for="method in paymentMethods"
                :key="method.id"
                @click="selectedPayment = method.id"
                :class="[
                  'flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all',
                  selectedPayment === method.id
                    ? 'border-[#E25C38] bg-[#FFF8F6]'
                    : 'border-gray-200 hover:bg-gray-50'
                ]"
              >
                <div 
                  class="w-4 h-4 rounded-full border flex items-center justify-center transition-all"
                  :class="selectedPayment === method.id ? 'border-[#E25C38]' : 'border-gray-300'"
                >
                  <div v-if="selectedPayment === method.id" class="w-2 h-2 rounded-full bg-[#E25C38]"></div>
                </div>
                <span class="text-xs font-bold text-gray-800">{{ method.name }}</span>
              </label>
            </div>
          </div>

        </div>

        <!-- KOLOM KANAN (RINGKASAN PESANAN) -->
        <div class="lg:col-span-4">
          <div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
            <h2 class="text-sm font-bold text-gray-900">Ringkasan Pesanan</h2>

            <div class="space-y-2 text-xs">
              <div class="flex justify-between text-gray-500">
                <span>Subtotal ({{ cartItems.length }} item)</span>
                <span class="font-bold text-gray-800">Rp {{ subtotal.toLocaleString('id-ID') }}</span>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>Ongkos Kirim</span>
                <span class="font-bold text-gray-800">Rp {{ shippingFee.toLocaleString('id-ID') }}</span>
              </div>
              <div class="flex justify-between text-emerald-600">
                <span>Diskon (MURAH25)</span>
                <span class="font-bold">- Rp {{ discount.toLocaleString('id-ID') }}</span>
              </div>
            </div>

            <hr class="border-gray-100" />

            <div class="flex justify-between items-baseline">
              <span class="text-xs font-bold text-gray-900">Total</span>
              <span class="text-lg font-extrabold text-[#E25C38]">Rp {{ total.toLocaleString('id-ID') }}</span>
            </div>

            <button class="w-full py-3 bg-[#14120E] hover:bg-black text-[#D4B26F] font-bold text-xs rounded-xl transition-all shadow-sm">
              Bayar Sekarang
            </button>

            <p class="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
              <span>🔒</span> Transaksi aman & terenkripsi
            </p>
          </div>
        </div>

      </div>
    </div>

    <!-- ==================== MODAL 1: PILIH ALAMAT PENGIRIMAN ==================== -->
    <div 
      v-if="showSelectModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div class="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4 animate-in fade-in zoom-in duration-150">
        <h3 class="text-base font-bold text-gray-900">Pilih Alamat Pengiriman</h3>

        <!-- OPSI ALAMAT -->
        <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          <div 
            v-for="addr in addresses" 
            :key="addr.id"
            @click="tempSelectedAddressId = addr.id"
            :class="[
              'p-4 rounded-xl border transition-all cursor-pointer relative',
              tempSelectedAddressId === addr.id
                ? 'border-[#E25C38] bg-[#FFF8F6]'
                : 'border-gray-200 hover:border-gray-300'
            ]"
          >
            <!-- RADIO HEADER -->
            <div class="flex items-center gap-2 mb-1">
              <div 
                class="w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0"
                :class="tempSelectedAddressId === addr.id ? 'border-[#E25C38]' : 'border-gray-300'"
              >
                <div v-if="tempSelectedAddressId === addr.id" class="w-1.5 h-1.5 rounded-full bg-[#E25C38]"></div>
              </div>
              <span class="text-xs font-bold text-gray-900">
                {{ addr.label }} <span v-if="addr.isPrimary" class="text-gray-400 font-normal">· Utama</span>
              </span>
            </div>

            <!-- DETAIL TEXT -->
            <div class="pl-5 text-xs text-gray-500 space-y-1">
              <p class="font-semibold text-gray-800">{{ addr.name }} · {{ addr.phone }}</p>
              <p class="text-[11px] leading-relaxed">{{ addr.address }}</p>
              
              <!-- ACTION BUTTONS (Ubah & Hapus) -->
              <div class="flex gap-3 pt-1">
                <button 
                  @click.stop="openEditModal(addr)" 
                  class="text-[11px] font-bold text-[#E25C38] hover:underline"
                >
                  Ubah
                </button>
                <button 
                  @click.stop="deleteAddress(addr.id)" 
                  class="text-[11px] font-bold text-red-500 hover:underline"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ACTION BUTTONS MODAL -->
        <div class="space-y-2 pt-2">
          <button 
            @click="openAddModal"
            class="w-full py-2.5 border border-gray-800 rounded-xl font-bold text-xs text-gray-900 hover:bg-gray-50 transition-colors"
          >
            + Tambah Alamat Baru
          </button>
          <button 
            @click="confirmAddressSelection"
            class="w-full py-2.5 bg-[#14120E] hover:bg-black text-[#D4B26F] font-bold text-xs rounded-xl transition-colors"
          >
            Gunakan Alamat Ini
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== MODAL 2 & 3: TAMBAH / EDIT ALAMAT BARU ==================== -->
    <div 
      v-if="showFormModal" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div class="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
        <h3 class="text-base font-bold text-gray-900">
          {{ isEditing ? 'Ubah Alamat' : 'Tambah Alamat Baru' }}
        </h3>

        <form @submit.prevent="saveAddress" class="space-y-3 text-xs">
          <div>
            <label class="block text-gray-500 font-medium mb-1">Nama Penerima</label>
            <input 
              v-model="addressForm.name" 
              type="text" 
              required
              placeholder="Budi Santoso" 
              class="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#E25C38]"
            />
          </div>

          <div>
            <label class="block text-gray-500 font-medium mb-1">No. Handphone</label>
            <input 
              v-model="addressForm.phone" 
              type="text" 
              required
              placeholder="0812-3456-7890" 
              class="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#E25C38]"
            />
          </div>

          <div>
            <label class="block text-gray-500 font-medium mb-1">Alamat Lengkap</label>
            <textarea 
              v-model="addressForm.address" 
              rows="3" 
              required
              placeholder="Jl. Melati No. 12, RT 04 / RW 06, Kebayoran Baru" 
              class="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#E25C38] resize-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-gray-500 font-medium mb-1">Kota / Kabupaten</label>
              <input 
                v-model="addressForm.city" 
                type="text" 
                required
                placeholder="Jakarta Selatan" 
                class="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#E25C38]"
              />
            </div>
            <div>
              <label class="block text-gray-500 font-medium mb-1">Kode Pos</label>
              <input 
                v-model="addressForm.postalCode" 
                type="text" 
                required
                placeholder="12150" 
                class="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#E25C38]"
              />
            </div>
          </div>

          <!-- FOOTER BUTTONS -->
          <div class="flex items-center gap-3 pt-2">
            <button 
              type="button" 
              @click="showFormModal = false; showSelectModal = true"
              class="flex-1 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit"
              class="flex-1 py-2.5 bg-[#14120E] hover:bg-black text-[#D4B26F] font-bold rounded-xl transition-colors"
            >
              Simpan Alamat
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>