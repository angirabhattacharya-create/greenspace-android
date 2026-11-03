import React, { useMemo, useState } from "react";
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, StatusBar } from "react-native";

const GREEN = "#237A45";
const services = [
  { id: "consult", title: "Video consultation", subtitle: "Talk to a gardening expert", price: 299, tag: "Online" },
  { id: "repot", title: "Repotting", subtitle: "Fresh soil and the right pot", price: 199, tag: "At home" },
  { id: "prune", title: "Pruning & trimming", subtitle: "Keep plants healthy and shaped", price: 249, tag: "At home" },
  { id: "weed", title: "Garden cleanup", subtitle: "A neat, healthy garden", price: 299, tag: "At home" },
  { id: "monthly", title: "Monthly garden care", subtitle: "Scheduled recurring maintenance", price: 999, tag: "Subscription" }
];
const products = [
  { id: "green-gold", name: "Green Gold Garden Mixture", detail: "500 g • Asim Shakti", price: 120 },
  { id: "vermi", name: "Vermicompost", detail: "Garden-ready soil nutrition", price: 90 },
  { id: "indoor", name: "Indoor plant selection", detail: "Easy-care plants for homes", price: 249 },
  { id: "potting", name: "Potting mixture", detail: "For balcony and terrace gardens", price: 99 }
];

export default function App() {
  const [tab, setTab] = useState("Home");
  const [booking, setBooking] = useState(null);
  const [address, setAddress] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [cart, setCart] = useState({});
  const [bookings, setBookings] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = useMemo(() => products.reduce((sum, p) => sum + p.price * (cart[p.id] || 0), 0), [cart]);

  const add = id => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  const submitBooking = () => {
    if (!address.trim() || !date.trim() || !time.trim()) return Alert.alert("Details required", "Please enter your address, preferred date and time.");
    setBookings(prev => [{ id: "GS" + Date.now().toString().slice(-6), service: booking.title, date, time, address, status: "Request received", price: booking.price }, ...prev]);
    setBooking(null); setTab("Bookings"); setDate(""); setTime(""); setNotes("");
    Alert.alert("Request received", "Our team will contact you to confirm availability and the final quote.");
  };

  const Header = () => <View style={s.header}><View><Text style={s.brand}>GreenSpace</Text><Text style={s.brandSub}>POWERED BY ASIM SHAKTI</Text></View><View style={s.location}><Text style={s.locationText}>⌖  Kolkata</Text></View></View>;
  const ServiceCard = ({ item }) => <View style={s.card}><View style={s.row}><Text style={s.tag}>{item.tag}</Text><Text style={s.price}>From ₹{item.price}</Text></View><Text style={s.cardTitle}>{item.title}</Text><Text style={s.muted}>{item.subtitle}</Text><TouchableOpacity style={s.buttonSmall} onPress={() => setBooking(item)}><Text style={s.buttonText}>Book service</Text></TouchableOpacity></View>;
  const StoreCard = ({ item }) => <View style={s.card}><View style={s.productArt}><Text style={{fontSize:32}}>🌱</Text></View><Text style={s.cardTitle}>{item.name}</Text><Text style={s.muted}>{item.detail}</Text><View style={s.row}><Text style={s.price}>₹{item.price}</Text><TouchableOpacity style={s.buttonSmall} onPress={() => add(item.id)}><Text style={s.buttonText}>Add +</Text></TouchableOpacity></View><Text style={s.muted}>In cart: {cart[item.id] || 0}</Text></View>;

  let content;
  if (booking) content = <ScrollView contentContainerStyle={s.content}><TouchableOpacity onPress={() => setBooking(null)}><Text style={s.link}>← Back</Text></TouchableOpacity><Text style={s.heading}>Book {booking.title}</Text><Text style={s.muted}>Starting from ₹{booking.price}. Final price is confirmed by our team.</Text><Text style={s.label}>Service address in Kolkata *</Text><TextInput style={s.input} placeholder="Flat, street, area and PIN code" value={address} onChangeText={setAddress}/><Text style={s.label}>Preferred date *</Text><TextInput style={s.input} placeholder="e.g. 15 Nov 2026" value={date} onChangeText={setDate}/><Text style={s.label}>Preferred time *</Text><TextInput style={s.input} placeholder="e.g. 11:00 AM" value={time} onChangeText={setTime}/><Text style={s.label}>Additional details</Text><TextInput style={[s.input,{height:88}]} multiline placeholder="Plants, number of pots or issue..." value={notes} onChangeText={setNotes}/><TouchableOpacity style={s.button} onPress={submitBooking}><Text style={s.buttonText}>Request booking</Text></TouchableOpacity><Text style={s.fine}>Demo only: booking is stored on this device. Live scheduling and online payment are not connected yet.</Text></ScrollView>;
  else if (tab === "Services") content = <ScrollView contentContainerStyle={s.content}><Text style={s.heading}>Gardening services</Text><Text style={s.muted}>Professional care for your home, balcony and terrace garden.</Text>{services.map(x => <ServiceCard key={x.id} item={x}/>)}</ScrollView>;
  else if (tab === "Store") content = <ScrollView contentContainerStyle={s.content}><Text style={s.heading}>Garden store</Text><Text style={s.muted}>Plants, growing media and gardening essentials.</Text><View style={s.cart}><Text style={s.cartText}>Cart: {cartCount} items • ₹{cartTotal}</Text><TouchableOpacity onPress={() => Alert.alert("Checkout not active", "Online checkout will be connected after backend and payment setup.")}><Text style={s.link}>Checkout →</Text></TouchableOpacity></View>{products.map(x => <StoreCard key={x.id} item={x}/>)}</ScrollView>;
  else if (tab === "Bookings") content = <ScrollView contentContainerStyle={s.content}><Text style={s.heading}>Your bookings</Text>{bookings.length === 0 ? <View style={s.empty}><Text style={{fontSize:38}}>🪴</Text><Text style={s.cardTitle}>No bookings yet</Text><Text style={s.muted}>Your service requests will appear here.</Text></View> : bookings.map(x => <View style={s.card} key={x.id}><Text style={s.tag}>{x.status}</Text><Text style={s.cardTitle}>{x.service}</Text><Text style={s.muted}>{x.date} • {x.time}</Text><Text style={s.muted}>{x.address}</Text><Text style={s.price}>₹{x.price} • {x.id}</Text></View>)}</ScrollView>;
  else if (tab === "Profile") content = <ScrollView contentContainerStyle={s.content}><Text style={s.heading}>Your profile</Text><View style={s.card}><Text style={s.label}>Name</Text><TextInput style={s.input} placeholder="Your name" value={name} onChangeText={setName}/><Text style={s.label}>Mobile number</Text><TextInput style={s.input} placeholder="Mobile number" keyboardType="phone-pad" value={phone} onChangeText={setPhone}/><Text style={s.fine}>OTP verification will be enabled in a later build.</Text><TouchableOpacity style={s.button} onPress={() => Alert.alert("Saved", "Profile details saved for this demo.")}><Text style={s.buttonText}>Save details</Text></TouchableOpacity></View></ScrollView>;
  else content = <ScrollView contentContainerStyle={s.content}><View style={s.hero}><Text style={s.eyebrow}>YOUR URBAN GARDENING PARTNER</Text><Text style={s.heroTitle}>A greener home{"\n"}starts here. 🌿</Text><Text style={s.heroText}>Expert plant care, right at your doorstep.</Text><TouchableOpacity style={s.heroButton} onPress={() => setTab("Services")}><Text style={s.buttonText}>Explore services →</Text></TouchableOpacity></View><Text style={s.heading}>What do you need today?</Text><View style={s.quickRow}>{[["📹","Consultation","Services"],["🪴","Maintenance","Services"],["🛍️","Plant store","Store"]].map(([e,l,t]) => <TouchableOpacity key={l} style={s.quick} onPress={() => setTab(t)}><Text style={{fontSize:25}}>{e}</Text><Text style={s.quickText}>{l}</Text></TouchableOpacity>)}</View><View style={s.row}><Text style={s.heading}>Popular services</Text><TouchableOpacity onPress={() => setTab("Services")}><Text style={s.link}>See all</Text></TouchableOpacity></View>{services.slice(0,3).map(x => <ServiceCard key={x.id} item={x}/>) }<View style={s.info}><Text style={s.cardTitle}>Local garden experts</Text><Text style={s.muted}>Our own team and verified independent gardeners, serving Kolkata.</Text></View></ScrollView>;

  return <SafeAreaView style={s.safe}><StatusBar barStyle="dark-content" backgroundColor="#F7FAF6"/><Header/>{content}<View style={s.tabs}>{["Home","Services","Bookings","Store","Profile"].map(x => <TouchableOpacity key={x} style={s.tab} onPress={() => {setBooking(null);setTab(x);}}><Text style={[s.tabText,tab===x&&s.active]}>{x}</Text></TouchableOpacity>)}</View></SafeAreaView>;
}

const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:"#F7FAF6"},header:{paddingHorizontal:20,paddingTop:12,paddingBottom:14,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},brand:{fontSize:25,fontWeight:"800",color:GREEN},brandSub:{fontSize:10,color:"#718174",letterSpacing:1},location:{backgroundColor:"#E8F2E8",paddingHorizontal:13,paddingVertical:9,borderRadius:20},locationText:{color:GREEN,fontWeight:"700"},
  content:{padding:18,paddingBottom:28},hero:{backgroundColor:"#DDEEDD",borderRadius:22,padding:22,marginBottom:24},eyebrow:{fontSize:10,fontWeight:"800",letterSpacing:1,color:GREEN},heroTitle:{fontSize:30,fontWeight:"800",color:"#173D25",marginTop:12,lineHeight:36},heroText:{color:"#49634F",marginTop:8},heroButton:{alignSelf:"flex-start",backgroundColor:GREEN,padding:12,borderRadius:12,marginTop:18},heading:{fontSize:20,fontWeight:"800",color:"#203B29",marginBottom:8,marginTop:6},row:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:8},quickRow:{flexDirection:"row",gap:9,marginVertical:15},quick:{flex:1,backgroundColor:"white",borderRadius:15,padding:14,alignItems:"center"},quickText:{fontSize:11,fontWeight:"700",color:"#34533B",marginTop:7},
  card:{backgroundColor:"white",borderRadius:17,padding:16,marginTop:12,borderWidth:1,borderColor:"#E8EEE7"},cardTitle:{fontSize:16,fontWeight:"800",color:"#243C2A",marginTop:9},muted:{fontSize:12,color:"#78857A",lineHeight:18,marginTop:4},tag:{fontSize:10,fontWeight:"800",color:GREEN,backgroundColor:"#EAF4E9",paddingHorizontal:10,paddingVertical:6,borderRadius:12,overflow:"hidden"},price:{fontWeight:"800",fontSize:15,color:GREEN},buttonSmall:{backgroundColor:GREEN,paddingHorizontal:16,paddingVertical:9,borderRadius:10,alignSelf:"flex-start",marginTop:13},button:{backgroundColor:GREEN,padding:15,borderRadius:13,alignItems:"center",marginTop:18},buttonText:{color:"white",fontWeight:"800"},productArt:{height:80,backgroundColor:"#EFF7EF",borderRadius:13,alignItems:"center",justifyContent:"center"},cart:{backgroundColor:"#E5F2E5",padding:14,borderRadius:14,marginTop:14,flexDirection:"row",justifyContent:"space-between"},cartText:{fontWeight:"800",color:"#23452D"},empty:{alignItems:"center",backgroundColor:"white",padding:28,borderRadius:18,marginTop:20},info:{backgroundColor:"#EDF5EB",padding:17,borderRadius:16,marginTop:20},label:{fontSize:13,fontWeight:"800",color:"#35513A",marginTop:16,marginBottom:7},input:{backgroundColor:"white",borderWidth:1,borderColor:"#DCE7DB",borderRadius:12,padding:13,fontSize:14,color:"#263B2A"},fine:{fontSize:11,color:"#849087",lineHeight:16,marginTop:12},link:{color:GREEN,fontWeight:"700"},tabs:{flexDirection:"row",backgroundColor:"white",borderTopWidth:1,borderTopColor:"#E6ECE5",paddingVertical:13},tab:{flex:1,alignItems:"center"},tabText:{fontSize:10,color:"#879389"},active:{color:GREEN,fontWeight:"800"}
});