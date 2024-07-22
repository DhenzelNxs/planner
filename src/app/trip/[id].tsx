import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Keyboard, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { TripDetails, tripServer } from "@/server/trip-server";
import { Loading } from "@/components/loading";
import { Input } from "@/components/input";
import { CalendarRange, Info, MapPin, Settings2, Calendar as IconCalendar, User } from "lucide-react-native";
import { colors } from "@/styles/colors";
import tw from "tailwind-react-native-classnames";
import dayjs from "dayjs";
import { Button } from "@/components/button";
import { Activities } from "./activities";
import { Details } from "./details";
import { Modal } from "@/components/modal";
import { DateData } from "react-native-calendars";
import { calendarUtils, DatesSelected } from "@/utils/calendarUtils";
import { Calendar } from "@/components/calendar";
import { validateInput } from "@/utils/validateInput";
import { participantsServer } from "@/server/participants-server";
import { tripStorage } from "@/storage/trip";

export type TripData = TripDetails & { when: string }

enum MODAL {
    NONE = 0,
    UPDATE_TRIP = 1,
    CALENDAR = 2,
    CONFIRM_ATTENDANCE = 3
}

export default function Trip() {

    const [isLoadingTrip, setIsLoadingTrip] = useState(true)
    const [isUpdatingTrip, setIsUpdatingTrip] = useState(false)
    const [isConfirmingAttendance, setIsConfirmingAttendance] = useState(false)

    const [showModal, setShowModal] = useState(MODAL.NONE)

    const [tripDetails, setTripDetails] = useState({} as TripData)
    const [option, setOption] = useState<"activity" | "details">("activity")
    const [destination, setDestination] = useState("")
    const [selectedDates, setSelectedDates] = useState({} as DatesSelected)
    const [guestName, setGuestName] = useState("")
    const [guestEmail, setGuestEmail] = useState("")

    const tripParams = useLocalSearchParams<{ id: string, participant?: string }>()

    async function getTripDetails() {
        try {
            setIsLoadingTrip(true)

            if(!tripParams.id) {
                return router.back()
            }

            if(tripParams.participant){
                setShowModal(MODAL.CONFIRM_ATTENDANCE)
            }

            const trip = await tripServer.getById(tripParams.id)
            
            const maxLengthDestination = 14
            const destination = trip.destination.length > maxLengthDestination 
            ? trip.destination.slice(0, maxLengthDestination) + "..."
            : trip.destination

            const starts_at = dayjs(trip.starts_at).format("DD")
            const ends_at = dayjs(trip.ends_at).format("DD")
            const month = dayjs(trip.starts_at).format("MMM")

            setDestination(trip.destination)

            setTripDetails({
                ...trip,
                when: `${destination} de ${starts_at} a ${ends_at} de ${month}.`
            })
        } catch (error) {
            console.log(error)
        } finally {
            setIsLoadingTrip(false)
        }
    }
    
    function handleSelectDate(selectedDay: DateData) {
        const dates = calendarUtils.orderStartsAtAndEndsAt({
            startsAt: selectedDates.startsAt,
            endsAt: selectedDates.endsAt,
            selectedDay
        })

        setSelectedDates(dates)
    }

    async function handleUpdateTrip() {
        try {
            if(!tripParams.id) {
                return
            }


            if(!destination || !selectedDates.startsAt || !selectedDates.endsAt) {
                return Alert.alert(
                    "Atualizar viagem",
                    "Lembre-se de, além de preencher o destino, selecione data de inìcio e fim da viagem."
                )
            }

            setIsUpdatingTrip(true)

            await tripServer.update({
                id: tripParams.id,
                destination,
                starts_at: dayjs(selectedDates.startsAt.dateString).toString(),
                ends_at: dayjs(selectedDates.endsAt.dateString).toString()
            })

            Alert.alert(
                "Atualizar viagem",
                "Viagem atualizada com sucesso!",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            setShowModal(MODAL.NONE)
                            getTripDetails()
                        },
                    }
                ]
            )

        } catch (error) {
            console.log(error)
        } finally {
            setIsUpdatingTrip(false)
        }
    } 

    async function handleConfirmAttendance(){
        try {
            if(!tripParams.id || !tripParams.participant){
                return
            }

            if(!guestEmail.trim() || !guestEmail.trim()){
                return Alert.alert(
                    "Confirmação",
                    "Preencha nome e e-mail para confirmar a viagem!"
                )
            }

            if(!validateInput.email(guestEmail.trim())){
                return Alert.alert(
                    "Confirmação",
                    "E-mail inválido!"
                )
            }

            setIsConfirmingAttendance(true)

            await participantsServer.confirmTripByParticipantId({
                participantId: tripParams.participant,
                name: guestName,
                email: guestEmail.trim(),
                tripId: tripParams.id
            })

            Alert.alert(
                "Confirmação",
                "Viagem confirmada com sucesso!"
            )

            await tripStorage.save(tripParams.id)

            setShowModal(MODAL.NONE)
        } catch (error) {
            console.log(error)
            Alert.alert(
                "Confirmação",
                "Não foi possivel confirmar!"
            )
        } finally {
            setIsConfirmingAttendance(false)
        }
    }

    async function handleRemoveTrip() {
        try {
            Alert.alert(
                "Remover viagem",
                "Tem certeza que deseja remover a viagem?",
                [
                    {
                        text: "Não",
                        style: "cancel"
                    },
                    {
                        text: "Sim",
                        onPress: async () => {
                            await tripStorage.remove()
                            router.navigate("/")
                        } 
                    }
                ]
            )
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getTripDetails()
    }, [])

    if(isLoadingTrip) {
        return <Loading />
    }


    return (
    <View className="flex-1 px-5 pt-16">
        <Input variant="tertiary">
            <MapPin color={colors.zinc[400]} size={20}/>
            <Input.Field value={tripDetails.when} readOnly />

            <TouchableOpacity 
            activeOpacity={0.7} 
            style={tw.style("w-9 h-9 bg-gray-800 items-center justify-center rounded")}
            onPress={() => setShowModal(MODAL.UPDATE_TRIP)}
            >
                <Settings2 color={colors.zinc[400]} size={20}/>
            </TouchableOpacity>
            
        </Input>

        {
            option === "activity" ? (
                <Activities tripDetails={tripDetails}/>
            ):
            (
                <Details tripId={tripDetails.id}/>
            )
        }

        <View className="w-full absolute -bottom-1 self-center justify-end pb-5 z-10 bg-zinc-950">
            <View className="w-full flex-row bg-zinc-900 p-4 rounded-lg border border-zinc-800 gap-2">
                <Button 
                style={tw.style('flex-1')} 
                onPress={() => setOption("activity")}
                variant={option === "activity" ? "primary" : "secondary"} >
                    <CalendarRange 
                    color={option === "activity" ? colors.lime[950] : colors.zinc[200]}
                    size={20}
                    />
                    <Button.Title>Atividades</Button.Title>
                </Button>

                <Button 
                style={tw.style('flex-1')} 
                onPress={() => setOption("details")}
                variant={option === "details" ? "primary" : "secondary"}>
                    <Info 
                    color={option === "details" ? colors.lime[950] : colors.zinc[200]}
                    size={20}
                    />
                    <Button.Title>Detalhes</Button.Title>
                </Button>
            </View>
        </View>

        <Modal 
        title="Atualizar viagem" 
        subtitle="Somente quem criou a viagem pode editar."
        visible={showModal === MODAL.UPDATE_TRIP}
        onClose={() => setShowModal(MODAL.NONE)}
        >
            <View className="gap-2 my-4">
                <Input variant="secondary">
                    <MapPin color={colors.zinc[400]} size={20} />
                    <Input.Field 
                    placeholder="Para onde?" 
                    onChangeText={setDestination}
                    value={destination}
                    />
                </Input>

                <Input variant="secondary">
                    <IconCalendar color={colors.zinc[400]} size={20} />
                    <Input.Field 
                    placeholder="Quando?" 
                    value={selectedDates.formatDatesInText}
                    onPressIn={() => setShowModal(MODAL.CALENDAR)}
                    onFocus={() => Keyboard.dismiss()}
                    />
                </Input>

                <Button onPress={handleUpdateTrip} isLoading={isUpdatingTrip}>
                    <Button.Title>Atualizar</Button.Title>
                </Button>
            </View>
        </Modal>

        <Modal 
                title='Selecionar datas'
                subtitle='Selecione a data de ida e volta da Viagem'
                visible={showModal === MODAL.CALENDAR}
                onClose={() => setShowModal(MODAL.NONE)}
            >
                <View className='gap-4 mt-4'>
                    <Calendar 
                        minDate={dayjs().toISOString()}
                        onDayPress={handleSelectDate}
                        markedDates={selectedDates.dates}
                    />

                    <Button onPress={() => setShowModal(MODAL.UPDATE_TRIP)}>
                        <Button.Title>Confirmar</Button.Title>
                    </Button>
                </View>
            </Modal>

        <Modal
            title="Confirmar presença"
            visible={showModal === MODAL.CONFIRM_ATTENDANCE}
        >
            <View className="gap-4 mat-4">
                <Text className="text-zinc-400 font-regular leading-6 my-2">
                    Você foi convidado(a) para participar de uma viagem para
                    <Text 
                    className="font-semibold text-zinc-100">
                        {" "}
                        {tripDetails.destination}{" "}
                    </Text>
                    nas datas de{" "}
                    <Text className="font-semibold text-zinc-100">
                        {dayjs(tripDetails.starts_at).date()} a{" "}
                        {dayjs(tripDetails.ends_at).date()} de{" "}
                        {dayjs(tripDetails.ends_at).format("MMMM")}. {"\n\n"}
                    </Text>
                    Para confirmar sua presença na viagem, preencha os dados abaixo:
                </Text> 

                <Input variant="secondary">
                    <User color={colors.zinc[400]} size={20} />
                    <Input.Field
                        placeholder="Seu nome completo"
                        onChangeText={setGuestName}
                    />
                </Input>

                <Input variant="secondary">
                    <User color={colors.zinc[400]} size={20} />
                    <Input.Field
                        placeholder="E-mail de confirmação"
                        onChangeText={setGuestEmail}
                    />
                </Input>

                <Button 
                isLoading={isConfirmingAttendance}
                onPress={handleConfirmAttendance}
                >
                    <Button.Title>
                        Confirmar minha presença
                    </Button.Title>
                </Button>

                <TouchableOpacity activeOpacity={0.8} onPress={handleRemoveTrip}>
                    <Text style={tw.style("text-red-400 text-center mt-6")}>
                        Remover viagem
                    </Text>
                </TouchableOpacity>
            </View>
        </Modal>

    </View>
)
}