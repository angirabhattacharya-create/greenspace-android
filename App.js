import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, StatusBar, Image, ImageBackground, Animated } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";

const GREEN = "#176B3A";
const DARK = "#163D28";
const PALE = "#F3F8F1";
const photo = {
  hero: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200&auto=format&fit=crop",
  garden: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?w=900&auto=format&fit=crop",
  adenium: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=800&auto=format&fit=crop",
  lily: "https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=800&auto=format&fit=crop",
  snake: "https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=800&auto=format&fit=crop",
  greenGold: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop",
  bio: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop",
  vermi: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop"
};
const services = [
  { id:"consult", title:"Video consultation", subtitle:"Talk to a gardening expert", price:299, tag:"ONLINE", image:photo.garden },
  { id:"repot", title:"Repotting", subtitle:"Fresh soil and the right pot", price:199, tag:"AT HOME", image:photo.adenium },
  { id:"prune", title:"Pruning & trimming", subtitle:"Keep plants healthy and shaped", price:249, tag:"AT HOME", image:photo.garden },
  { id:"weed", title:"Garden cleanup", subtitle:"A neat, healthy garden", price:299, tag:"AT HOME", image:photo.hero },
  { id:"monthly", title:"Monthly garden care", subtitle:"Scheduled recurring maintenance", price:999, tag:"MONTHLY", image:photo.hero }
];
const products = [
  {id:"adenium",name:"Adenium Plant",detail:"Desert Rose • flowering plant",price:249,image:photo.adenium,category:"Plants"},
  {id:"lily",name:"Lily Plant",detail:"Elegant flowering lily",price:299,image:photo.lily,category:"Plants"},
  {id:"snake",name:"Snake Lily",detail:"Architectural foliage plant",price:199,image:photo.snake,category:"Plants"},
  {id:"green-gold",name:"Green Gold",detail:"Garden Mixture • 500 g",price:120,image:photo.greenGold,category:"Garden inputs"},
  {id:"bio",name:"Bio Stimulant",detail:"Plant growth support",price:199,image:photo.bio,category:"Garden inputs"},
  {id:"vermi",name:"Vermicompost",detail:"Garden soil conditioner",price:99,image:photo.vermi,category:"Garden inputs"}
];

export default function App() {
  const [tab,setTab]=useState("Home"), [booking,setBooking]=useState(null), [showSplash,setShowSplash]=useState(true);
  const [address,setAddress]=useState(""), [date,setDate]=useState(""), [time,setTime]=useState("");
  const [notes,setNotes]=useState(""), [cart,setCart]=useState({}), [bookings,setBookings]=useState([]);
  const [name,setName]=useState(""), [phone,setPhone]=useState(""), [category,setCategory]=useState("All"), [search,setSearch]=useState("");
  const fade=useRef(new Animated.Value(0)).current;
  const lift=useRef(new Animated.Value(18)).current;
  useEffect(()=>{const splashTimer=setTimeout(()=>setShowSplash(false),1900);Animated.parallel([
    Animated.timing(fade,{toValue:1,duration:850,useNativeDriver:true}),
    Animated.spring(lift,{toValue:0,speed:13,bounciness:5,useNativeDriver:true})
  ]).start();return ()=>clearTimeout(splashTimer);},[]);
  const cartCount=Object.values(cart).reduce((a,b)=>a+b,0);
  const cartTotal=useMemo(()=>products.reduce((sum,p)=>sum+p.price*(cart[p.id]||0),0),[cart]);
  const add=id=>setCart(prev=>({...prev,[id]:(prev[id]||0)+1}));
  const changeQty=(id,delta)=>setCart(prev=>{const next={...prev,[id]:Math.max(0,(prev[id]||0)+delta)};if(!next[id])delete next[id];return next;});
  const visibleProducts=products.filter(p=>(category==="All"||p.category===category)&&(!search||`${p.name} ${p.detail}`.toLowerCase().includes(search.toLowerCase())));
  const submitBooking=()=>{
    if(!address.trim()||!date.trim()||!time.trim()) return Alert.alert("Details required","Please enter your address, preferred date and time.");
    setBookings(prev=>[{id:"SP"+Date.now().toString().slice(-6),service:booking.title,date,time,address,status:"Request received",price:booking.price},...prev]);
    setBooking(null);setTab("Bookings");setDate("");setTime("");setNotes("");
    Alert.alert("Request received","Our team will contact you to confirm availability and the final quote.");
  };
  const Header=()=> <View style={s.header}>
    <View style={s.headerLeft}>
      {(tab!=="Home" || booking) && <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back to Home" style={s.backHome} onPress={()=>{setBooking(null);setTab("Home");}}><Text style={s.backHomeText}>‹</Text></TouchableOpacity>}
      <View style={s.brandLine}><View style={s.brandMark}><Text style={s.brandLeaf}>✿</Text></View><View><Text style={s.brand}>SpacePeace</Text><Text style={s.brandSub}>POWERED BY ASIM SHAKTI</Text></View></View>
    </View>
    <TouchableOpacity style={s.cartHeader} onPress={()=>setTab("Cart")}><Text style={s.cartHeaderIcon}>🛒</Text>{cartCount>0&&<View style={s.cartBadge}><Text style={s.cartBadgeText}>{cartCount}</Text></View>}</TouchableOpacity><View style={s.location}><Text style={s.locationText}>⌖ Kolkata</Text></View>
  </View>;
  const ServiceCard=({item})=><View style={s.serviceCard}>
    <Image source={{uri:item.image}} style={s.serviceImage}/>
    <View style={s.serviceBody}><View style={s.row}><Text style={s.tag}>{item.tag}</Text><Text style={s.price}>From ₹{item.price}</Text></View>
      <Text style={s.cardTitle}>{item.title}</Text><Text style={s.muted}>{item.subtitle}</Text>
      <TouchableOpacity style={s.buttonSmall} onPress={()=>setBooking(item)}><Text style={s.buttonText}>Book service →</Text></TouchableOpacity>
    </View>
  </View>;
  const ProductCard=({item})=><TouchableOpacity activeOpacity={0.9} style={s.productCard} onPress={()=>Alert.alert(item.name,item.detail+"\n\nPrice: ₹"+item.price+"\n\nProduct details and online checkout will be enabled in the next stage.")}>
    <Image source={{uri:item.image}} style={s.productImage}/>
    <View style={s.productBody}><Text style={s.productName}>{item.name}</Text><Text style={s.muted} numberOfLines={2}>{item.detail}</Text>
      <View style={s.row}><Text style={s.price}>₹{item.price}</Text><TouchableOpacity style={s.addButton} onPress={()=>add(item.id)}><Text style={s.addText}>{cart[item.id]?"+"+cart[item.id]:"＋"}</Text></TouchableOpacity></View>
    </View>
  </TouchableOpacity>;
  let content;
  if(booking) content=<ScrollView contentContainerStyle={s.content}><TouchableOpacity onPress={()=>setBooking(null)}><Text style={s.link}>← Back</Text></TouchableOpacity><Text style={s.heading}>Book {booking.title}</Text><Text style={s.muted}>Starting from ₹{booking.price}. Final price is confirmed by our team.</Text>
    <Text style={s.label}>Service address in Kolkata *</Text><TextInput style={s.input} placeholder="Flat, street, area and PIN code" value={address} onChangeText={setAddress}/>
    <Text style={s.label}>Preferred date *</Text><TextInput style={s.input} placeholder="e.g. 15 Nov 2026" value={date} onChangeText={setDate}/>
    <Text style={s.label}>Preferred time *</Text><TextInput style={s.input} placeholder="e.g. 11:00 AM" value={time} onChangeText={setTime}/>
    <Text style={s.label}>Additional details</Text><TextInput style={[s.input,{height:88}]} multiline placeholder="Plants, number of pots or issue..." value={notes} onChangeText={setNotes}/>
    <TouchableOpacity style={s.button} onPress={submitBooking}><Text style={s.buttonText}>Request booking</Text></TouchableOpacity><Text style={s.fine}>Demo only: booking is stored on this device. Live scheduling and online payment are not connected yet.</Text></ScrollView>;
  else if(tab==="Services") content=<ScrollView contentContainerStyle={s.content}><ImageBackground source={{uri:photo.hero}} style={s.pageBanner} imageStyle={{borderRadius:20}}><Text style={s.bannerTitle}>Care that helps your garden thrive.</Text></ImageBackground><Text style={s.heading}>Gardening services</Text><Text style={s.muted}>Professional care for your home, balcony and terrace garden.</Text>{services.map(x=><ServiceCard key={x.id} item={x}/>)}</ScrollView>;
  else if(tab==="Store") content=<ScrollView contentContainerStyle={s.content}><ImageBackground source={{uri:photo.garden}} style={s.storeBanner} imageStyle={{borderRadius:20}}><Text style={s.bannerTitle}>Bring home a little more green.</Text><Text style={s.bannerSub}>Plants, garden inputs and essentials</Text></ImageBackground>
    <View style={s.row}><Text style={s.heading}>Garden store</Text><Text style={s.cartPill}>🛒 {cartCount} • ₹{cartTotal}</Text></View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filters}>{["All","Plants","Garden inputs"].map(c=><TouchableOpacity key={c} onPress={()=>setCategory(c)} style={[s.filter,category===c&&s.filterActive]}><Text style={[s.filterText,category===c&&s.filterTextActive]}>{c}</Text></TouchableOpacity>)}</ScrollView>
    <View style={s.productGrid}>{visibleProducts.map(p=><ProductCard key={p.id} item={p}/>)}</View>
    <TouchableOpacity style={s.button} onPress={()=>Alert.alert("Checkout not active","Online checkout will be connected after backend and payment setup.")}><Text style={s.buttonText}>View cart & checkout →</Text></TouchableOpacity>
  </ScrollView>;
  else if(tab==="Cart") content=<ScrollView contentContainerStyle={s.content}><Text style={s.heading}>Your cart</Text>{cartCount===0?<View style={s.empty}><Text style={{fontSize:42}}>🛒</Text><Text style={s.cardTitle}>Your cart is empty</Text><Text style={s.muted}>Add plants and garden essentials to get started.</Text><TouchableOpacity style={s.button} onPress={()=>setTab("Store")}><Text style={s.buttonText}>Explore store</Text></TouchableOpacity></View>:<><Text style={s.muted}>{cartCount} item(s) in your cart</Text>{products.filter(p=>cart[p.id]>0).map(p=><View style={s.cartItem} key={p.id}><Image source={{uri:p.image}} style={s.cartImage}/><View style={{flex:1}}><Text style={s.productName}>{p.name}</Text><Text style={s.price}>₹{p.price} each</Text><View style={s.qtyRow}><TouchableOpacity style={s.qtyButton} onPress={()=>changeQty(p.id,-1)}><Text style={s.qtyText}>−</Text></TouchableOpacity><Text style={s.qtyValue}>{cart[p.id]}</Text><TouchableOpacity style={s.qtyButton} onPress={()=>changeQty(p.id,1)}><Text style={s.qtyText}>＋</Text></TouchableOpacity></View></View><Text style={s.price}>₹{p.price*cart[p.id]}</Text></View>)}<View style={s.totalRow}><Text style={s.cardTitle}>Subtotal</Text><Text style={s.totalPrice}>₹{cartTotal}</Text></View><TouchableOpacity style={s.button} onPress={()=>Alert.alert("Checkout not active","Online checkout will be connected after backend and payment setup.")}><Text style={s.buttonText}>Continue to checkout →</Text></TouchableOpacity><Text style={s.fine}>Demo cart only. Online payment is not connected yet.</Text></>}</ScrollView>;
  else if(tab==="Bookings") content=<ScrollView contentContainerStyle={s.content}><Text style={s.heading}>Your bookings</Text>{bookings.length===0?<View style={s.empty}><Text style={{fontSize:42}}>🪴</Text><Text style={s.cardTitle}>No bookings yet</Text><Text style={s.muted}>Your service requests will appear here.</Text></View>:bookings.map(x=><View style={s.card} key={x.id}><Text style={s.tag}>{x.status}</Text><Text style={s.cardTitle}>{x.service}</Text><Text style={s.muted}>{x.date} • {x.time}</Text><Text style={s.muted}>{x.address}</Text><Text style={s.price}>₹{x.price} • {x.id}</Text></View>)}</ScrollView>;
  else if(tab==="Profile") content=<ScrollView contentContainerStyle={s.content}><Text style={s.heading}>Your profile</Text><View style={s.card}><Text style={s.label}>Name</Text><TextInput style={s.input} placeholder="Your name" value={name} onChangeText={setName}/><Text style={s.label}>Mobile number</Text><TextInput style={s.input} placeholder="Mobile number" keyboardType="phone-pad" value={phone} onChangeText={setPhone}/><Text style={s.fine}>OTP verification will be enabled in a later build.</Text><TouchableOpacity style={s.button} onPress={()=>Alert.alert("Saved","Profile details saved for this demo.")}><Text style={s.buttonText}>Save details</Text></TouchableOpacity></View></ScrollView>;
  else content=<ScrollView contentContainerStyle={s.content}>
    <Animated.View style={{opacity:fade,transform:[{translateY:lift}]}}>
      <View style={s.searchBox}><Text style={s.searchIcon}>⌕</Text><TextInput style={s.searchInput} placeholder="Search plants, soil, services..." placeholderTextColor="#8A9A90" value={search} onChangeText={setSearch}/></View>
      <ImageBackground source={{uri:photo.hero}} style={s.hero} imageStyle={{borderRadius:24}}>
        <View style={s.heroShade}><Text style={s.eyebrow}>URBAN GARDENING</Text><Text style={s.heroTitle}>A greener home starts right here.</Text><Text style={s.heroText}>Plants, products & expert care delivered to your door.</Text><TouchableOpacity style={s.heroButton} onPress={()=>Alert.alert("AI Plant Identifier","Photo-based plant identification will be added in a future version.")}><Text style={s.buttonText}>✦  AI Plant Identifier</Text></TouchableOpacity></View>
      </ImageBackground>
      <Text style={s.sectionLabel}>WHAT DO YOU NEED TODAY?</Text>
      <View style={s.quickRow}>{[["🎧","Consult","Services"],["✂️","Maintain","Services"],["🏪","Store","Store"],["✦","AI Scan","Scan"]].map(([e,l,t])=><TouchableOpacity key={l} style={[s.quick,t==="Scan"&&s.quickDark]} onPress={()=>t==="Scan"?Alert.alert("AI Plant Identifier","Photo-based plant identification will be added in a future version."):setTab(t)}><Text style={{fontSize:24,color:t==="Scan"?"#FCD34D":GREEN}}>{e}</Text><Text style={[s.quickText,t==="Scan"&&{color:"white"}]}>{l}</Text></TouchableOpacity>)}</View>
      <View style={s.featured}><View style={s.featureTop}><View><Text style={s.featureTag}>FEATURED GARDEN ESSENTIAL</Text><Text style={s.cardTitle}>Green Gold</Text><Text style={s.muted}>Garden Mixture • 500 g</Text></View><Text style={s.featureIcon}>🌱</Text></View><View style={s.featureBottom}><View><Text style={s.featurePrice}>₹120</Text><Text style={s.fine}>Demo listing price</Text></View><TouchableOpacity style={s.featureAdd} onPress={()=>add("green-gold")}><Text style={s.buttonText}>＋ Add to cart</Text></TouchableOpacity></View></View>
      <View style={s.row}><Text style={s.heading}>Popular services</Text><TouchableOpacity onPress={()=>setTab("Services")}><Text style={s.link}>See all →</Text></TouchableOpacity></View>
      {services.slice(0,3).map(x=><ServiceCard key={x.id} item={x}/>)}
      <View style={s.row}><Text style={s.heading}>Plants & garden essentials</Text><TouchableOpacity onPress={()=>setTab("Store")}><Text style={s.link}>Shop all →</Text></TouchableOpacity></View>
      <View style={s.productGrid}>{products.slice(0,4).map(p=><ProductCard key={p.id} item={p}/>)}</View>
      <View style={s.promise}><Text style={s.promiseTitle}>Grow • Care • Nurture</Text><Text style={s.muted}>A little green can make every space feel like home.</Text></View>
    </Animated.View></ScrollView>;
  if(showSplash) return <SafeAreaProvider><SafeAreaView style={[s.safe,{justifyContent:"center",alignItems:"center",backgroundColor:"#E8F3E5"}]}><StatusBar barStyle="dark-content" backgroundColor="#E8F3E5"/><Animated.View style={{alignItems:"center",opacity:fade,transform:[{scale:fade.interpolate({inputRange:[0,1],outputRange:[0.82,1]})}]}}><Image source={require("./assets/logo.png")} style={{width:300,height:300}} resizeMode="contain"/><Text style={{fontSize:13,color:"#54735B",marginTop:12}}>Grow • Care • Nurture</Text></Animated.View></SafeAreaView></SafeAreaProvider>;
  return <SafeAreaProvider><SafeAreaView style={s.safe}><StatusBar barStyle="dark-content" backgroundColor={PALE}/><Header/>{content}
    <View style={s.tabs}>{[["Home","⌂"],["Services","✂"],["Store","🛍"],["Bookings","▣"],["Profile","◯"]].map(([x,ico])=><TouchableOpacity key={x} style={s.tab} onPress={()=>{setBooking(null);setTab(x);}}><Text style={[s.tabIcon,tab===x&&s.active]}>{ico}</Text><Text style={[s.tabText,tab===x&&s.active]}>{x}</Text></TouchableOpacity>)}</View>
  </SafeAreaView>;
}

const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:PALE},header:{paddingHorizontal:18,paddingTop:8,paddingBottom:13,flexDirection:"row",justifyContent:"space-between",alignItems:"center",backgroundColor:PALE},headerLeft:{flexDirection:"row",alignItems:"center",gap:9},cartHeader:{width:38,height:38,borderRadius:19,backgroundColor:"#E3F0E3",alignItems:"center",justifyContent:"center",marginLeft:"auto",marginRight:8},cartHeaderIcon:{fontSize:18},cartBadge:{position:"absolute",top:-3,right:-3,minWidth:17,height:17,borderRadius:9,backgroundColor:"#FBBF24",alignItems:"center",justifyContent:"center"},cartBadgeText:{fontSize:10,fontWeight:"900",color:"#163D28"},backHome:{width:32,height:32,borderRadius:11,backgroundColor:"#E3F0E3",alignItems:"center",justifyContent:"center"},backHomeText:{fontSize:29,lineHeight:31,color:GREEN,fontWeight:"700",marginTop:-3},brandLine:{flexDirection:"row",alignItems:"center",gap:9},brandMark:{width:38,height:38,borderRadius:12,backgroundColor:"#E3F0E3",alignItems:"center",justifyContent:"center"},brandLeaf:{fontSize:25,color:GREEN},logoMark:{width:39,height:39,borderRadius:14,backgroundColor:"#E0F0DF",alignItems:"center",justifyContent:"center"},brand:{fontSize:23,fontWeight:"900",color:GREEN,letterSpacing:-0.6},brandSub:{fontSize:9,color:"#718477",letterSpacing:1.1,marginTop:1},location:{backgroundColor:"#E3F0E3",paddingHorizontal:13,paddingVertical:9,borderRadius:20},locationText:{color:GREEN,fontWeight:"800",fontSize:12},
 content:{padding:17,paddingBottom:35},searchBox:{height:44,backgroundColor:"white",borderRadius:15,borderWidth:1,borderColor:"#E1EAE0",flexDirection:"row",alignItems:"center",paddingHorizontal:13,marginBottom:16},searchIcon:{fontSize:25,color:"#7B8D80",marginRight:8},searchInput:{flex:1,fontSize:13,color:DARK,paddingVertical:0},sectionLabel:{fontSize:11,fontWeight:"900",letterSpacing:1,color:"#64766A",marginBottom:2,marginTop:4},featured:{backgroundColor:"white",borderRadius:21,padding:16,borderWidth:1,borderColor:"#E5EEE4",marginTop:12,marginBottom:8},featureTop:{flexDirection:"row",justifyContent:"space-between",alignItems:"center"},featureTag:{fontSize:9,fontWeight:"900",color:"#A66A12",letterSpacing:0.8,marginBottom:5},featureIcon:{fontSize:38,backgroundColor:"#F0F7E9",padding:12,borderRadius:16},featureBottom:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:14},featurePrice:{fontSize:22,fontWeight:"900",color:GREEN},featureAdd:{backgroundColor:GREEN,paddingHorizontal:15,paddingVertical:11,borderRadius:12},cartItem:{flexDirection:"row",alignItems:"center",gap:11,backgroundColor:"white",padding:12,borderRadius:16,marginTop:11,borderWidth:1,borderColor:"#E5EEE4"},cartImage:{width:64,height:64,borderRadius:12},qtyRow:{flexDirection:"row",alignItems:"center",gap:12,marginTop:8},qtyButton:{width:27,height:27,borderRadius:9,backgroundColor:"#E4F2E3",alignItems:"center",justifyContent:"center"},qtyText:{fontSize:18,fontWeight:"900",color:GREEN},qtyValue:{fontSize:13,fontWeight:"800",color:DARK},totalRow:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingTop:18,marginTop:10,borderTopWidth:1,borderColor:"#E5EEE4"},totalPrice:{fontSize:22,fontWeight:"900",color:GREEN},hero:{height:280,marginBottom:24,justifyContent:"flex-end"},heroShade:{backgroundColor:"rgba(7,43,22,0.48)",padding:21,borderRadius:24},eyebrow:{fontSize:10,fontWeight:"900",letterSpacing:1.3,color:"#D9F5D8"},heroTitle:{fontSize:31,fontWeight:"900",color:"white",lineHeight:37,marginTop:10},heroText:{fontSize:14,color:"#F2FFF1",marginTop:7},heroButton:{alignSelf:"flex-start",backgroundColor:"#168047",paddingHorizontal:17,paddingVertical:13,borderRadius:13,marginTop:16},
 heading:{fontSize:21,fontWeight:"900",color:DARK,marginBottom:8,marginTop:8,letterSpacing:-0.3},row:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",marginTop:10},quickRow:{flexDirection:"row",gap:10,marginVertical:14},quick:{flex:1,backgroundColor:"white",borderRadius:16,paddingVertical:13,paddingHorizontal:5,alignItems:"center",borderWidth:1,borderColor:"#E5EEE4"},quickDark:{backgroundColor:"#14532D",borderColor:"#14532D"},quickText:{fontSize:11,fontWeight:"800",color:"#34533B",marginTop:8},
 serviceCard:{backgroundColor:"white",borderRadius:20,overflow:"hidden",marginTop:14,borderWidth:1,borderColor:"#E5EEE4",flexDirection:"row",minHeight:150},serviceImage:{width:112,minHeight:150},serviceBody:{flex:1,padding:13,justifyContent:"center"},tag:{fontSize:9,fontWeight:"900",color:GREEN,backgroundColor:"#E8F4E7",paddingHorizontal:9,paddingVertical:6,borderRadius:12,overflow:"hidden"},cardTitle:{fontSize:16,fontWeight:"900",color:DARK,marginTop:9},muted:{fontSize:12,color:"#78877B",lineHeight:18,marginTop:4},price:{fontWeight:"900",fontSize:14,color:GREEN},buttonSmall:{backgroundColor:GREEN,paddingHorizontal:14,paddingVertical:10,borderRadius:11,alignSelf:"flex-start",marginTop:11},button:{backgroundColor:GREEN,padding:15,borderRadius:14,alignItems:"center",marginTop:18},buttonText:{color:"white",fontWeight:"900",fontSize:13},link:{color:GREEN,fontWeight:"900"},
 pageBanner:{height:145,justifyContent:"flex-end",padding:17,marginBottom:18},bannerTitle:{fontSize:23,fontWeight:"900",color:"white",textShadowColor:"rgba(0,0,0,0.5)",textShadowRadius:8},bannerSub:{color:"white",fontWeight:"700",marginTop:5},storeBanner:{height:165,justifyContent:"flex-end",padding:18,marginBottom:15},filters:{marginVertical:12},filter:{paddingHorizontal:16,paddingVertical:9,borderRadius:18,backgroundColor:"white",marginRight:8,borderWidth:1,borderColor:"#E4ECE3"},filterActive:{backgroundColor:GREEN,borderColor:GREEN},filterText:{fontSize:12,color:"#526657",fontWeight:"800"},filterTextActive:{color:"white"},
 productGrid:{flexDirection:"row",flexWrap:"wrap",justifyContent:"space-between",marginTop:7},productCard:{width:"48.2%",backgroundColor:"white",borderRadius:17,overflow:"hidden",marginBottom:12,borderWidth:1,borderColor:"#E5EEE4"},productImage:{width:"100%",height:135,backgroundColor:"#E7F0E5"},productBody:{padding:11},productName:{fontSize:14,fontWeight:"900",color:DARK},addButton:{width:30,height:30,borderRadius:10,backgroundColor:"#E4F2E3",alignItems:"center",justifyContent:"center"},addText:{fontSize:18,color:GREEN,fontWeight:"900"},cartPill:{backgroundColor:"#E4F2E3",paddingHorizontal:12,paddingVertical:8,borderRadius:15,color:GREEN,fontWeight:"900",fontSize:12},
 empty:{alignItems:"center",backgroundColor:"white",padding:28,borderRadius:18,marginTop:20},card:{backgroundColor:"white",borderRadius:17,padding:16,marginTop:12,borderWidth:1,borderColor:"#E5EEE4"},label:{fontSize:13,fontWeight:"900",color:"#35513A",marginTop:16,marginBottom:7},input:{backgroundColor:"white",borderWidth:1,borderColor:"#DCE7DB",borderRadius:12,padding:13,fontSize:14,color:"#263B2A"},fine:{fontSize:11,color:"#849087",lineHeight:16,marginTop:12},promise:{backgroundColor:"#E4F1E1",padding:19,borderRadius:18,marginTop:18},promiseTitle:{fontSize:18,fontWeight:"900",color:GREEN},tabs:{flexDirection:"row",backgroundColor:"white",borderTopWidth:1,borderTopColor:"#E4ECE3",paddingTop:9,paddingBottom:8,minHeight:62},tab:{flex:1,alignItems:"center",gap:3},tabIcon:{fontSize:18,color:"#829087"},tabText:{fontSize:10,color:"#829087",fontWeight:"700"},active:{color:GREEN,fontWeight:"900"}
});